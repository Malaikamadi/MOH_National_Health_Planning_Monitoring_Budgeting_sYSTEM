# Deploy the web app on Vercel

Vercel hosts **only** `apps/web` (Next.js). The FastAPI API and Keycloak must run elsewhere (Railway, Render, Fly.io, Azure, on-prem, etc.).

## 1. Import the GitHub repo

1. [Vercel Dashboard](https://vercel.com/new) → **Add New Project** → import  
   `Malaikamadi/MOH_National_Health_Planning_Monitoring_Budgeting_sYSTEM`.

### Option A — Services preset (matches Vercel monorepo detection)

1. **Root Directory:** `./` (repository root).
2. **Application Preset:** **Services** (Vercel reads root [`vercel.json`](../vercel.json) `experimentalServices`).
3. Deploy **only** the `web` service (`apps/web`). Do **not** add `services/api` on Vercel until you have a managed Postgres and a serverless-compatible API build — use Option B for API on Railway/Render/etc.
4. **Install Command:** `pnpm install --frozen-lockfile` (from root `vercel.json`).

### Option B — Next.js only (simpler)

1. **Root Directory:** `apps/web`.
2. **Framework Preset:** Next.js.
3. **Install Command:**
   ```bash
   cd ../.. && pnpm install --frozen-lockfile
   ```
4. **Build Command:** `pnpm build`
5. Enable **“Include source files outside of the Root Directory”** if Vercel asks (pnpm workspace).

**Node.js:** 20.x (matches root `package.json` engines).

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

Set these for **Production** (and **Preview** if you use preview deployments).

| Variable | Example | Notes |
|----------|---------|--------|
| `AUTH_SECRET` | *(openssl rand -base64 32)* | **Required** in production; build/runtime will fail without it. |
| `AUTH_URL` | `https://your-app.vercel.app` | Public URL of this Vercel app (no trailing slash). For previews you can use `https://$VERCEL_URL` only if you set it per-deployment; see below. |
| `KEYCLOAK_CLIENT_ID` | `nhpmbr-web` | Same as Keycloak client. |
| `KEYCLOAK_CLIENT_SECRET` | *(from Keycloak)* | Not the dev default in production. |
| `KEYCLOAK_ISSUER` | `https://auth.example.gov/realms/nhpmbr` | **Must be HTTPS** and reachable from the internet (not `localhost`). |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.example.gov` | Deployed FastAPI base URL (no trailing slash). |
| `NEXT_PUBLIC_APP_NAME` | `NHPMBR` | Optional label in UI. |

**Preview deployments:** Either set `AUTH_URL` to each preview URL manually, or add a single production URL first and use a stable custom domain. Auth.js needs `AUTH_URL` to match the browser origin for callbacks.

Optional aliases (still supported): `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.

**Before clicking Deploy**, add at least these in the Vercel UI (Environment Variables section). Generate `AUTH_SECRET` locally:

```bash
openssl rand -base64 32
```

| Key | Value |
|-----|--------|
| `AUTH_SECRET` | *(output of command above)* |
| `AUTH_URL` | `https://<your-project>.vercel.app` |
| `KEYCLOAK_CLIENT_ID` | `nhpmbr-web` |
| `KEYCLOAK_CLIENT_SECRET` | *(from your hosted Keycloak client)* |
| `KEYCLOAK_ISSUER` | `https://<keycloak-host>/realms/nhpmbr` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://<your-api-host>` |
| `NEXT_PUBLIC_APP_NAME` | `NHPMBR` |

## 3. Keycloak (required for sign-in)

In Keycloak Admin → realm **nhpmbr** → client **nhpmbr-web**:

- **Valid redirect URIs:**  
  `https://your-app.vercel.app/api/auth/callback/keycloak`  
  For previews: `https://*.vercel.app/api/auth/callback/keycloak` (if your Keycloak version allows wildcards).
- **Web origins:**  
  `https://your-app.vercel.app`  
  (and preview origins if needed).

Local dev URIs (`http://localhost:3000/*`) are in `infra/docker/keycloak/nhpmbr-realm.json` only — add production URLs in the admin console or update the realm export and re-import.

## 4. API backend

Deploy `services/api` separately. Then set `NEXT_PUBLIC_API_BASE_URL` to that host.

The Next.js rewrite proxies browser calls from `/api/v1/*` to that URL (`next.config.mjs`). Ensure the API allows CORS from your Vercel domain.

## 5. Deploy

Push to `main` or click **Deploy** in Vercel. First build needs all env vars above (especially `AUTH_SECRET`).

## 6. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Build fails: `Set AUTH_SECRET` | Add `AUTH_SECRET` in Vercel env vars. |
| `error=Configuration` after login | Wrong `KEYCLOAK_ISSUER`, secret, or redirect URI not registered in Keycloak. |
| Dashboard empty / API errors | `NEXT_PUBLIC_API_BASE_URL` wrong or API not deployed / CORS blocked. |
| `pnpm install` fails | Root Directory must be `apps/web` and install must run from repo root (`cd ../..`). |
| Works on custom domain but not preview | Set Keycloak redirect URIs / `AUTH_URL` for that preview URL. |

## 7. What not to deploy on Vercel

- `services/api` (FastAPI) — use a container/VM host.
- `infra/docker-compose.dev.yml` — local dev only.
- `.env` / `.env.local` — never commit; use Vercel env UI.
