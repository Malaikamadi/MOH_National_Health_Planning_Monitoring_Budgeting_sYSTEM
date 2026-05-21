# NHPMBR Web

Next.js 14 (App Router) web app for the National Health Planning, Monitoring,
Budgeting & Reporting Platform.

## Stack

- **Next.js 14** with App Router and React Server Components for low-bandwidth users
- **TypeScript** (strict, `noUncheckedIndexedAccess`)
- **Tailwind CSS** with a small custom design system in `globals.css`
- **TanStack Query** for client-side data fetching/mutations
- **Auth.js (NextAuth v5)** with the **Keycloak** provider — the backend's OIDC IdP
- **lucide-react** for iconography
- **Zod** for runtime validation at trust boundaries

## Run locally

```bash
# from repo root
make up          # bring up postgres + keycloak + api
cd apps/web
cp .env.example .env.local
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

Sign in via Ministry SSO — for local Keycloak the seeded user is
`admin@nhpmbr.local` / `Admin123!Change`.

### Blank page on `/login` or `/dashboard`

Auth.js lives at `/api/auth/*`. The dev rewrite in `next.config.mjs` must **only**
proxy `/api/v1/*` to FastAPI. If `/api/auth/*` is rewritten to the Python API,
sign-in breaks and those routes can render blank. This is fixed in the scaffold;
if you change rewrites, keep NextAuth paths excluded.

## App structure

```
src/
├── app/
│   ├── page.tsx                # public marketing/landing page
│   ├── login/page.tsx          # OIDC sign-in entry point
│   ├── dashboard/              # executive AWP status (MVP centrepiece)
│   ├── awps/                   # AWP list (data-driven from API)
│   └── api/auth/[...nextauth]/ # Auth.js route handler
├── components/
│   ├── layout/                 # Sidebar, Topbar
│   └── ui/                     # Button, StatusPill, ...
└── lib/
    ├── api-client.ts           # typed HTTP wrapper around the FastAPI API
    ├── auth.ts                 # NextAuth v5 + Keycloak provider
    ├── query-client.tsx        # TanStack Query provider
    └── cn.ts                   # Tailwind class merge helper
```

## API client

`src/lib/api-client.ts` is a thin typed wrapper. Once the FastAPI OpenAPI
spec stabilises, replace the hand-written types with auto-generated ones
from `packages/shared-types/` so the contract is enforced at build time.

```ts
import { api } from '@/lib/api-client';
import { auth } from '@/lib/auth';

const session = await auth();
const awps = await api.get<AwpOut[]>('/api/v1/planning/awps', {
  token: session?.accessToken,
});
```

## Accessibility

- All interactive elements have visible focus rings (WCAG 2.1 AA).
- Tailwind classes ensure 4.5:1 contrast on text by default.
- Forms use semantic labels; iconography always paired with text.

## Translations

Strings are inline for the MVP. From Phase 1 onwards we'll extract them
into `messages/{en,kri,fr}.json` and use `next-intl` for i18n.
