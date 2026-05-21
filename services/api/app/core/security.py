"""Authentication & authorization primitives.

* JWT verification (Keycloak-issued in stage/prod; HS256 dev secret in local dev).
* :class:`Principal` is the in-process representation of the authenticated user.
* :func:`require` is the permission-check decorator used by routers.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Annotated, Any

import httpx
import jwt
from fastapi import Depends, Header, HTTPException, status
from jwt import PyJWKClient

from app.core.config import settings
from app.core.errors import AuthenticationFailure, PermissionDenied

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(settings.oidc_jwks_url, cache_keys=True, lifespan=3600)
    return _jwks_client


@dataclass(frozen=True)
class Scope:
    """An organisational scope assigned to a user."""

    scope_type: str  # 'global', 'directorate', 'programme', 'district', 'facility', 'funding_source'
    scope_ref_id: uuid.UUID | None


@dataclass(frozen=True)
class Principal:
    """The authenticated caller, decoded from a verified token.

    Build this once per request and pass it through to services. **Never** trust
    the request body to identify the user.
    """

    user_id: uuid.UUID
    email: str
    full_name: str
    roles: frozenset[str] = field(default_factory=frozenset)
    permissions: frozenset[str] = field(default_factory=frozenset)
    scopes: tuple[Scope, ...] = ()
    raw_token: str = ""

    def has_permission(self, perm: str) -> bool:
        return perm in self.permissions or "*" in self.permissions

    def has_role(self, role: str) -> bool:
        return role in self.roles

    @property
    def is_global(self) -> bool:
        return any(s.scope_type == "global" for s in self.scopes)


def _decode_token(token: str) -> dict[str, Any]:
    """Verify a JWT against Keycloak's JWKS (or the dev HS256 secret)."""
    try:
        if settings.is_dev_like and not _is_oidc_token(token):
            return jwt.decode(
                token,
                settings.jwt_dev_secret,
                algorithms=[settings.jwt_algorithm],
                audience=settings.oidc_audience,
                options={"verify_aud": False},
            )

        signing_key = _get_jwks_client().get_signing_key_from_jwt(token).key
        return jwt.decode(
            token,
            signing_key,
            algorithms=["RS256", "ES256"],
            audience=settings.oidc_audience,
            issuer=settings.oidc_issuer,
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError as e:
        raise AuthenticationFailure("Token expired.") from e
    except jwt.InvalidTokenError as e:
        raise AuthenticationFailure(f"Invalid token: {e}") from e
    except httpx.HTTPError as e:
        raise AuthenticationFailure("JWKS unreachable.") from e


def _is_oidc_token(token: str) -> bool:
    try:
        header = jwt.get_unverified_header(token)
        return header.get("alg", "").startswith("RS") or header.get("alg", "").startswith("ES")
    except Exception:  # noqa: BLE001
        return False


def _principal_from_claims(claims: dict[str, Any], token: str) -> Principal:
    realm_roles = claims.get("realm_access", {}).get("roles", []) or []
    user_id_raw = claims.get("nhpmbr_user_id") or claims.get("sub")
    if not user_id_raw:
        raise AuthenticationFailure("Token missing subject.")
    try:
        user_id = uuid.UUID(str(user_id_raw))
    except ValueError as e:
        raise AuthenticationFailure("Token subject is not a UUID.") from e

    scopes = tuple(
        Scope(scope_type=s.get("type"), scope_ref_id=_safe_uuid(s.get("ref")))
        for s in claims.get("nhpmbr_scopes", [])
        if s.get("type")
    )
    if not scopes:
        scopes = (Scope(scope_type="global", scope_ref_id=None),) if "super_admin" in realm_roles else ()

    return Principal(
        user_id=user_id,
        email=claims.get("email", ""),
        full_name=claims.get("name", ""),
        roles=frozenset(realm_roles),
        permissions=frozenset(claims.get("nhpmbr_permissions", [])),
        scopes=scopes,
        raw_token=token,
    )


def _safe_uuid(v: Any) -> uuid.UUID | None:
    if not v:
        return None
    try:
        return uuid.UUID(str(v))
    except (TypeError, ValueError):
        return None


# ----- FastAPI dependency -----


async def get_principal(
    authorization: Annotated[str | None, Header()] = None,
) -> Principal:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ", 1)[1].strip()
    claims = _decode_token(token)
    return _principal_from_claims(claims, token)


def require(permission: str) -> Any:
    """Dependency factory: ensures the caller has ``permission``.

    Usage:

        @router.post("/awp/{id}/approve", dependencies=[Depends(require("planning.awp.approve"))])
    """

    async def _checker(principal: Annotated[Principal, Depends(get_principal)]) -> Principal:
        if not principal.has_permission(permission):
            raise PermissionDenied(
                f"Missing permission: {permission}",
                {"required_permission": permission},
            )
        return principal

    return _checker


CurrentPrincipal = Annotated[Principal, Depends(get_principal)]
