#!/bin/sh
# Sets the NHPMBR dev admin password via Keycloak Admin API.
# Realm JSON import does not reliably apply plaintext credentials; this script does.
set -eu

KC="${KEYCLOAK_INTERNAL_URL:-http://keycloak:8080}"
MASTER_USER="${KEYCLOAK_ADMIN:-admin}"
MASTER_PASS="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM="${NHPMBR_REALM:-nhpmbr}"
APP_USER="${NHPMBR_DEV_USER:-admin@nhpmbr.local}"
APP_PASS="${NHPMBR_DEV_PASSWORD:-Admin123!Change}"

create_dev_user() {
  _token="$1"
  echo "Creating dev user ${APP_USER} ..."
  BODY="$(
    jq -n \
      --arg u "${APP_USER}" \
      --arg p "${APP_PASS}" \
      '{
        username: $u,
        email: $u,
        firstName: "Platform",
        lastName: "Admin",
        enabled: true,
        emailVerified: true,
        credentials: [{type: "password", value: $p, temporary: false}]
      }'
  )"
  code="$(
    curl -s -o /tmp/nhpmbr_kc_create_user.txt -w "%{http_code}" -X POST "${KC}/admin/realms/${REALM}/users" \
      -H "Authorization: Bearer ${_token}" \
      -H "Content-Type: application/json" \
      -d "${BODY}"
  )"
  if [ "${code}" != "201" ]; then
    echo "Create user failed: HTTP ${code}" >&2
    cat /tmp/nhpmbr_kc_create_user.txt >&2 || true
    exit 1
  fi
  curl -s -G "${KC}/admin/realms/${REALM}/users" \
    --data-urlencode "username=${APP_USER}" \
    --data-urlencode "exact=true" \
    -H "Authorization: Bearer ${_token}" | jq -r '.[0].id // empty'
}

echo "Waiting for Keycloak at ${KC} ..."
n=0
while [ "${n}" -lt 90 ]; do
  if curl -sf "${KC}/health/ready" >/dev/null 2>&1; then
    echo "Keycloak is ready."
    break
  fi
  n=$((n + 1))
  sleep 2
done
if [ "${n}" -ge 90 ]; then
  echo "Timed out waiting for Keycloak /health/ready" >&2
  exit 1
fi

sleep 2

TOKEN="$(
  curl -s -X POST "${KC}/realms/master/protocol/openid-connect/token" \
    -d client_id=admin-cli \
    -d username="${MASTER_USER}" \
    -d password="${MASTER_PASS}" \
    -d grant_type=password | jq -r '.access_token // empty'
)"

if [ -z "${TOKEN}" ] || [ "${TOKEN}" = "null" ]; then
  echo "Failed to obtain master admin token (check KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD)" >&2
  exit 1
fi

USER_ID="$(
  curl -s -G "${KC}/admin/realms/${REALM}/users" \
    --data-urlencode "username=${APP_USER}" \
    --data-urlencode "exact=true" \
    -H "Authorization: Bearer ${TOKEN}" | jq -r '.[0].id // empty'
)"

if [ -z "${USER_ID}" ]; then
  USER_ID="$(create_dev_user "${TOKEN}")"
else
  echo "Resetting password for existing user ${APP_USER} ..."
  BODY="$(jq -n --arg p "${APP_PASS}" '{type: "password", value: $p, temporary: false}')"
  code="$(
    curl -s -o /tmp/nhpmbr_kc_reset_pw.txt -w "%{http_code}" -X PUT "${KC}/admin/realms/${REALM}/users/${USER_ID}/reset-password" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "${BODY}"
  )"
  if [ "${code}" != "204" ]; then
    if grep -q invalidPasswordHistoryMessage /tmp/nhpmbr_kc_reset_pw.txt 2>/dev/null; then
      echo "Password history blocked reset; deleting and recreating user (dev only) ..."
      dcode="$(
        curl -s -o /dev/null -w "%{http_code}" -X DELETE "${KC}/admin/realms/${REALM}/users/${USER_ID}" \
          -H "Authorization: Bearer ${TOKEN}"
      )"
      if [ "${dcode}" != "204" ]; then
        echo "DELETE user failed: HTTP ${dcode}" >&2
        exit 1
      fi
      sleep 1
      USER_ID="$(create_dev_user "${TOKEN}")"
    else
      echo "reset-password failed: HTTP ${code}" >&2
      cat /tmp/nhpmbr_kc_reset_pw.txt >&2 || true
      exit 1
    fi
  fi
fi

ROLE_ID="$(
  curl -s "${KC}/admin/realms/${REALM}/roles/super_admin" \
    -H "Authorization: Bearer ${TOKEN}" | jq -r '.id // empty'
)"
if [ -z "${ROLE_ID}" ]; then
  echo "Realm role super_admin not found — check realm import" >&2
  exit 1
fi

HAS_ROLE="$(
  curl -s "${KC}/admin/realms/${REALM}/users/${USER_ID}/role-mappings/realm" \
    -H "Authorization: Bearer ${TOKEN}" | jq '[.[] | select(.name == "super_admin")] | length'
)"
if [ "${HAS_ROLE}" = "0" ]; then
  echo "Assigning realm role super_admin ..."
  code="$(
    curl -s -o /tmp/nhpmbr_kc_roles.txt -w "%{http_code}" -X POST "${KC}/admin/realms/${REALM}/users/${USER_ID}/role-mappings/realm" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "[{\"id\":\"${ROLE_ID}\",\"name\":\"super_admin\"}]"
  )"
  if [ "${code}" != "204" ]; then
    echo "Role mapping failed: HTTP ${code}" >&2
    cat /tmp/nhpmbr_kc_roles.txt >&2 || true
    exit 1
  fi
fi

echo "NHPMBR dev login: ${APP_USER} / ${APP_PASS}"
