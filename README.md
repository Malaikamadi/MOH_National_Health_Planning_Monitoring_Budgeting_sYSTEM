# National Health Planning, Monitoring, Budgeting & Reporting Platform (NHPMBR)

> A national digital infrastructure for the Ministry of Health, replacing fragmented
> Excel-based planning, reporting, and M&E processes with a unified, modular, and
> interoperable platform.

**Status:** Architecture documented · MVP scaffold in place · ready for Phase 1 development.
**Audience:** Ministry of Health leadership, directorate heads, donors, partners,
implementation team (engineering, M&E, ICT, district staff).

---

## 1. Why this platform exists

The Ministry of Health currently runs strategic planning, annual work planning,
programme management, budgeting, M&E, and reporting across hundreds of disconnected
Excel workbooks, Word documents, PDFs, emails, and shared drives. This produces:

- Slow, manual, and error-prone consolidation of district and directorate data.
- No single source of truth on what is planned, funded, implemented, and achieved.
- Limited visibility for leadership, donors, and partners.
- Duplicated indicators and unreconciled budgets across funding sources.
- Inability to respond rapidly to outbreaks, stockouts, or service-delivery gaps.

NHPMBR replaces this with a centralized, modular, API-first platform that supports
the full national health planning lifecycle, designed for the **infrastructure
realities of Sierra Leone** — unreliable internet, intermittent electricity,
constrained device capabilities at the district and facility level, and the need
for sovereign control over sensitive government data.

## 2. Architectural North Stars

Every design decision in this repository is measured against these principles.

1. **Modular monolith first, microservices when justified.** Avoid premature
   distributed-systems complexity; preserve the option to split bounded contexts
   later behind clean module boundaries.
2. **API-first.** Every capability is exposed through a versioned REST/JSON API
   (with OpenAPI specs); the web and mobile clients are just consumers.
3. **Offline-first at the edge.** District and facility users must be able to
   work fully offline and sync when connectivity returns.
4. **Single source of truth.** One canonical model for organisations, indicators,
   facilities, budgets, and plans. Everything else references it.
5. **Interoperability by design.** First-class adapters for DHIS2, FHIR R4, HL7,
   and government finance systems (IFMIS).
6. **Security and auditability are non-negotiable.** RBAC, full audit trails,
   field-level redaction, and immutable change history on planning and budget
   entities.
7. **Built for low-resource environments.** Bandwidth-aware UIs, progressive
   enhancement, server-side rendering where helpful, aggressive caching, and
   small mobile bundle sizes.
8. **Sovereign by default.** The platform must be deployable on government
   infrastructure or sovereign-cloud regions, not locked to a single hyperscaler.

## 3. Documentation map

Read in order for the full architectural narrative.

| # | Document | Purpose |
|---|----------|---------|
| 01 | [High-level architecture](docs/01-high-level-architecture.md) | System context, container view, deployment topology, offline-first strategy |
| 02 | [System modules](docs/02-system-modules.md) | The ~24 bounded contexts that make up the platform |
| 03 | [Database schema](docs/03-database-schema.md) | Core entities, relationships, indexing, and partitioning strategy |
| 04 | [Development roadmap](docs/04-development-roadmap.md) | Phased delivery plan, team shape, and risk register |
| 05 | [MVP scope](docs/05-mvp-scope.md) | What ships in the first release and what explicitly does not |

## 4. Technology stack (summary)

| Layer | Choice | Rationale (see docs for full reasoning) |
|-------|--------|-----------------------------------------|
| Web frontend | Next.js 14 (App Router), React 18, Tailwind CSS, TanStack Query | SSR for low-bandwidth, mature ecosystem, strong forms/state story |
| Mobile | React Native + Expo (EAS), WatermelonDB or SQLite, expo-secure-store | Single-language stack, OTA updates, robust offline SQLite |
| API | FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2.x, Alembic | Async-friendly, OpenAPI built-in, strong typing, scientific/ML ecosystem |
| Database | PostgreSQL 16 (+ PostGIS, pg_trgm, pgvector) | Spatial, search, and embeddings in one system; battle-tested |
| Cache / queue | Redis 7, Celery (or Arq) for async workers | Standard, well-understood, easy to operate |
| Object storage | S3-compatible (AWS S3 / MinIO on-prem) | Sovereignty-friendly via MinIO; same API for both |
| Auth | Keycloak (OIDC) issuing JWTs, with platform-level RBAC | Government-grade IAM, SSO-ready, supports MFA & WebAuthn |
| Search & analytics | Postgres FTS first, OpenSearch & ClickHouse later | Defer complexity until volumes justify it |
| BI | Apache Superset or Metabase on a read replica / warehouse | Self-service analytics for Ministry analysts |
| Integration | DHIS2 Web API, FHIR R4 (HAPI as gateway), HL7 v2 via Mirth Connect | Standards-based, widely adopted in African health systems |
| Observability | OpenTelemetry, Prometheus, Grafana, Loki, Sentry | Open-source, portable, sovereign-friendly |
| Infra | Terraform + Ansible; Kubernetes (EKS or self-hosted k3s) | Reproducible, portable across AWS and on-prem |
| CI/CD | GitHub Actions, Trivy, Snyk/OWASP DC, ArgoCD (later) | Standard, secure-by-default pipelines |

## 5. Repository layout (scaffolded)

The repository now contains a working MVP scaffold. Phase 1 fills in the
module bodies, Phases 2+ extend per `docs/04-development-roadmap.md`.

```
nhpmbr/
├── apps/
│   └── web/                 # Next.js 14 web app — App Router, Tailwind, Auth.js + Keycloak
├── services/
│   └── api/                 # FastAPI modular monolith
│       ├── app/
│       │   ├── core/        # config, db, security, deps, errors, logging, telemetry, middleware
│       │   ├── modules/     # iam · org · mdm · strategy · planning · workflow · doc · audit
│       │   │   └── <name>/
│       │   │       ├── models.py · schemas.py · repository.py
│       │   │       ├── service.py · router.py · api.py    (* api.py = public interface *)
│       │   ├── integrations/# dhis2, fhir, ifmis, hris        (Phase 5)
│       │   └── workers/     # celery tasks                    (Phase 2+)
│       ├── alembic/         # 0001 + 0002 migrations (all 8 schemas)
│       ├── tests/           # pytest (health + state machine + audit hash chain)
│       └── pyproject.toml
├── packages/
│   └── shared-types/        # OpenAPI-generated TS clients (placeholder)
├── infra/
│   ├── docker-compose.dev.yml  # postgres + redis + minio + keycloak + api
│   └── docker/
│       ├── postgres/init/   # extensions + UUIDv7 helper
│       └── keycloak/        # nhpmbr realm export
├── docs/                    # Architecture & design (1–5)
├── data/                    # Seed scripts (placeholder)
├── .github/workflows/       # CI: api · web · security
├── Makefile · pnpm-workspace.yaml · package.json · .env.example
```

## 6. Quickstart (local development)

Prerequisites: Docker Desktop, Node 20+, pnpm 9, Python 3.12, `uv`.

```bash
# 1. Clone, then from the repo root:
cp .env.example .env             # adjust if needed (defaults work for local)

# 2. Bring up the full backend stack (postgres + redis + minio + keycloak + api)
make bootstrap                   # builds images, starts stack, runs migrations

# 3. Run the web app on the host (faster HMR)
cd apps/web
cp .env.example .env.local
pnpm install
pnpm dev
```

Then visit:

| Service | URL | Notes |
|---------|-----|-------|
| Web | http://localhost:3000 | Landing page; "Sign in" routes through Keycloak |
| API | http://localhost:8000/docs | Swagger UI with every endpoint, OIDC-protected |
| Keycloak | http://localhost:8080 | admin / admin · seeded realm `nhpmbr` |
| MinIO Console | http://localhost:9001 | Bucket `nhpmbr-dev` auto-created |

Seeded Keycloak user: `admin@nhpmbr.local` / `Admin123!Change`.

## 7. How to use this repository today

1. Read `docs/01-high-level-architecture.md` end-to-end.
2. Walk through `docs/02-system-modules.md` with each directorate to validate
   that the module list matches their real workflows.
3. Review `docs/03-database-schema.md` with the M&E and finance teams to
   confirm indicators, budget structure, and chart-of-accounts mapping.
4. Use `docs/04-development-roadmap.md` to align stakeholders on sequencing,
   team composition, and donor funding tranches.
5. Use `docs/05-mvp-scope.md` as the contract for the first 4-month delivery.

## 8. Governance

- **Product owner:** Director of Policy, Planning & Information (or designate).
- **Technical authority:** Director of ICT / digital health lead.
- **Steering committee:** DPPI, ICT, DHS, DPHA, Finance, key donors.
- **Change control:** All schema and API changes require an ADR
  (Architecture Decision Record) committed to `docs/adr/` and signed off by
  the technical authority.

---

_This is a living document. Pull requests welcome from any directorate
or partner with a stake in the platform._
