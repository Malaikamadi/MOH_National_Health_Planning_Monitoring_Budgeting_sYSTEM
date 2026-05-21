# 01 — High-Level Architecture

This document describes the system at three zoom levels: **system context**,
**container view**, and **deployment topology**. It also explains the
cross-cutting concerns — offline-first, security, observability, integration —
that shape every module.

---

## 1. System context (who and what touches the platform)

```
                              ┌──────────────────────────────────────┐
                              │      Ministry of Health (HQ)         │
                              │  Minister · DPPI · Directorate Heads │
                              │  Programme Managers · M&E · Finance  │
                              └───────────────┬──────────────────────┘
                                              │ Web (Next.js)
                                              ▼
   ┌────────────────────┐         ┌──────────────────────────┐         ┌─────────────────────┐
   │   Donors / Partners│ ─────▶  │   NHPMBR Platform        │ ◀────── │   District Health   │
   │   (read-only views)│         │  (API-first, modular)    │   Web   │   Management Teams  │
   └────────────────────┘         │                          │         └─────────────────────┘
                                  │                          │
   ┌────────────────────┐         │                          │         ┌─────────────────────┐
   │   DHIS2            │ ◀─────▶ │                          │ ◀────── │   Facility Officers │
   │   (service data)   │  REST   │                          │  Mobile │   (offline-first)   │
   └────────────────────┘         │                          │  (RN)   └─────────────────────┘
                                  │                          │
   ┌────────────────────┐         │                          │         ┌─────────────────────┐
   │   IFMIS (Finance)  │ ◀─────▶ │                          │ ◀────── │   Programmes /      │
   │   HRIS · Logistics │  SFTP/  │                          │         │   Vertical Units    │
   └────────────────────┘  API    └──────────────────────────┘         └─────────────────────┘
                                              │
                                              ▼
                                  ┌──────────────────────────┐
                                  │  FHIR R4 / HL7 Gateway   │  Interoperability with
                                  │  (HAPI · Mirth)          │  partner clinical systems
                                  └──────────────────────────┘
```

### Key actors

| Actor | Channel | Primary actions |
|-------|---------|-----------------|
| Minister & senior leadership | Web | Strategic dashboards, signed reports, drill-down |
| DPPI (Policy, Planning & Info) | Web | Owns strategic plan, consolidates AWPs, M&E framework |
| Directorate heads | Web | Approve directorate AWPs, manage programmes, sign-off reports |
| Programme managers | Web | Define activities, set targets, track outputs, manage budgets |
| District M&E officers | Web + Mobile | Enter district reports, review facility data, request approvals |
| Facility officers / CHWs | Mobile (offline) | Submit periodic reports, upload evidence, log activities |
| Finance officers | Web | Track budget execution, reconcile with IFMIS, donor reporting |
| Donors & partners | Web (scoped view) | Read-only dashboards filtered to their funding |
| ICT administrators | Web + CLI | Manage users, roles, integrations, audit |
| External systems (DHIS2, IFMIS, HRIS) | API / SFTP | Bidirectional data exchange |

### Trust boundaries

1. **Public internet → API gateway** — TLS 1.3, WAF, rate limiting, OIDC.
2. **API gateway → modular monolith** — mTLS inside VPC.
3. **Monolith → database / object store** — IAM-scoped, encrypted in transit and at rest.
4. **Edge devices (mobile / district nodes) → API** — JWT + device attestation + payload signing for sync envelopes.
5. **Integration adapters → external systems** — per-system credentials in a secret manager (HashiCorp Vault or AWS Secrets Manager), never in code.

---

## 2. Container view (logical components)

```
                         ┌────────────────────────────────────────────┐
                         │              CDN / Edge Cache              │
                         │      (Cloudflare or AWS CloudFront)        │
                         └──────────────┬─────────────────────────────┘
                                        │
                         ┌──────────────▼─────────────────────────────┐
                         │        API Gateway / Load Balancer         │
                         │      (Nginx + WAF, or AWS ALB + WAF)       │
                         └──────────────┬─────────────────────────────┘
                                        │
   ┌────────────────────────────────────┼──────────────────────────────────────────────┐
   │                                    │                                              │
   ▼                                    ▼                                              ▼
┌──────────┐                  ┌──────────────────────┐                       ┌──────────────────┐
│ Next.js  │                  │   FastAPI Monolith   │                       │  Keycloak (OIDC) │
│ Web App  │                  │  (modular contexts)  │                       │  Identity Server │
│ (SSR)    │ ◀──── REST ────▶ │                      │ ◀──── OIDC tokens ──▶ │                  │
└──────────┘                  │  - IAM               │                       └──────────────────┘
                              │  - Org               │
┌──────────┐                  │  - Strategy          │                       ┌──────────────────┐
│ RN/Expo  │ ◀── REST + ───▶  │  - Planning          │ ◀── async jobs ─────▶ │ Celery / Arq     │
│ Mobile   │    sync envelope │  - Budget            │                       │ Workers          │
└──────────┘                  │  - M&E / Indicators  │                       └────────┬─────────┘
                              │  - Reporting         │                                │
┌──────────┐                  │  - Workflow          │                                ▼
│ Superset │ ◀── SQL ───────▶ │  - Documents         │                       ┌──────────────────┐
│ / BI     │   (read replica) │  - Notifications     │                       │ Notifications    │
└──────────┘                  │  - Audit             │                       │ (SMS/Email/Push) │
                              │  - Integrations      │                       └──────────────────┘
                              │  - AI/Insights       │
                              └──────────┬───────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            ▼                            ▼                            ▼
   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────────┐
   │  PostgreSQL 16  │         │     Redis 7     │         │   S3 / MinIO        │
   │  + PostGIS      │         │  (cache, queue, │         │   (evidence files,  │
   │  + pg_trgm      │         │   rate limits)  │         │   reports, exports) │
   │  + pgvector     │         └─────────────────┘         └─────────────────────┘
   │                 │
   │  ├─ primary     │
   │  └─ read replica│
   └─────────────────┘
```

### Why a modular monolith, not microservices

For a Ministry-scale platform at year 0, microservices would be a **mistake**:

- Operational overhead (service mesh, distributed tracing, per-service CI/CD, schema coordination) is enormous and the in-country DevOps capacity is thin.
- Cross-context transactions (e.g. approving an AWP that updates budget, workflow, audit, and indicators atomically) are trivial in a monolith and hard across services.
- We do not yet know which contexts have independent scaling needs.

Instead:

- Build a **modular monolith** (`services/api/app/modules/<context>/`) with strict module boundaries:
  - Each module owns its tables (schema prefix, e.g. `planning_*`).
  - Modules expose **internal Python interfaces** (`services/api/app/modules/planning/api.py`) and external HTTP routers.
  - Cross-module calls go through those internal interfaces — never raw SQL across module schemas.
- Enforce boundaries with a lint rule (`import-linter` or a custom AST check in CI).
- When a module proves it needs independent scaling (most likely: **Integrations**, **AI/Insights**, **Reporting workers**), extract it. The interface is already there.

### Why FastAPI (Python)

- Async-native, OpenAPI generated automatically — the **API-first contract** is enforced by the framework itself.
- Pydantic v2 gives us validated DTOs that double as documentation and as the source for typed client SDKs (TypeScript clients for web/mobile via `openapi-typescript-codegen`).
- Python ecosystem makes the **AI/Insights**, **GIS analytics**, and **DHIS2/FHIR integration** modules far easier than Node or Go would.
- Familiar to most public-health informatics teams (DHIS2 ecosystem, OpenHIE community).

### Why PostgreSQL (and only PostgreSQL initially)

A single PostgreSQL 16 cluster with extensions gives us:

- Relational integrity for planning, budget, and audit data.
- **PostGIS** for facility / chiefdom / district geometries and spatial queries.
- **pg_trgm** for fuzzy search on facility names, indicators, narrative reports.
- **pgvector** for embedding-based semantic search (M&E narratives, document corpus).
- Full ACID transactions across all modules — essential for approvals.
- Logical replication for warm standby and BI read replicas.
- Mature backup/PITR story (pgBackRest, WAL-G).

Deferring OpenSearch and a dedicated warehouse (ClickHouse, Snowflake) until volumes justify the operational cost is deliberate.

---

## 3. Deployment topology

NHPMBR must be deployable in three modes without architectural changes:

| Mode | Primary use case | Where |
|------|------------------|-------|
| **Sovereign cloud (recommended)** | National production | A government-approved region (AWS af-south-1 Cape Town, Azure South Africa, or a regional sovereign cloud) |
| **Hybrid** | Data residency for sensitive datasets | Core DB and document store on-prem at MoH HQ; stateless services in cloud |
| **On-prem / air-gapped** | Disaster recovery; pilot deployments | Self-hosted Kubernetes (k3s) at MoH data centre with MinIO instead of S3 |

### Reference cloud deployment (AWS af-south-1)

```
                  Route 53
                      │
                      ▼
                AWS WAF + CloudFront
                      │
                      ▼
   ┌──────────────────────────────────────────────┐
   │                  VPC (3 AZ)                  │
   │                                              │
   │  Public subnets:    ALB                      │
   │                      │                       │
   │  Private subnets:    │                       │
   │   ┌─────────────────▼──────────────────┐     │
   │   │  EKS cluster                       │     │
   │   │  - api (FastAPI) deployment        │     │
   │   │  - workers (Celery) deployment     │     │
   │   │  - web (Next.js) deployment        │     │
   │   │  - keycloak deployment             │     │
   │   │  - integrations sidecar pods       │     │
   │   └────────────────────────────────────┘     │
   │                                              │
   │   RDS PostgreSQL 16 (Multi-AZ, encrypted)    │
   │   ElastiCache Redis (Multi-AZ)               │
   │   S3 buckets (SSE-KMS, versioned)            │
   │   Secrets Manager · KMS · Parameter Store    │
   │   VPC endpoints for S3, SM, KMS              │
   └──────────────────────────────────────────────┘

   CloudWatch + OpenTelemetry → Managed Grafana
   AWS Backup → cross-region snapshot to eu-west-1
```

### District edge deployment (optional, recommended for chronically offline districts)

A small **edge node** at the district health office:

- Mini-PC or NUC running Ubuntu Server with UPS + solar backup.
- Local read replica of district-scoped data (PostgreSQL logical replication, row-filtered).
- Local MinIO for evidence file caching.
- Local PWA cache + sync proxy so facility tablets sync to the edge node when at the district HQ, and the edge node syncs to central whenever upstream connectivity exists.
- Managed by Ansible from MoH ICT.

This pattern is critical for Sierra Leone: facility staff travelling to the district HQ for monthly meetings can sync over LAN/Wi-Fi rather than burning mobile data, and the district retains operational continuity during national outages.

---

## 4. Offline-first strategy

This is the single hardest engineering problem in the platform and gets dedicated treatment.

### Principles

1. **The mobile app is fully functional offline.** Every screen reads from a local SQLite/WatermelonDB database. The network is treated as an *optimization*, not a precondition.
2. **All user-generated entities have a UUIDv7 client-generated ID.** No client ever waits for a server-assigned ID.
3. **Sync is conflict-aware, not conflict-free.** We accept that conflicts will happen and design explicit resolution rules per entity type.
4. **The sync protocol is versioned.** Apps on old versions degrade gracefully.

### Sync protocol (simplified)

```
Client → Server  POST /api/v1/sync/push
{
  "device_id": "uuid",
  "client_clock": 174923,           // monotonic per-device
  "since_server_seq": 8921344,      // last server sequence acknowledged
  "envelope": [
    {
      "op": "upsert",
      "entity": "activity_progress",
      "id": "uuidv7",
      "version": 3,
      "client_updated_at": "2026-05-17T08:12:33Z",
      "payload": { ... },
      "evidence_refs": ["s3://staging/abc.jpg"]
    },
    ...
  ]
}

Server → Client  Response
{
  "server_seq": 8923010,
  "accepted":   ["uuidv7", ...],
  "conflicts":  [
     { "id": "uuidv7", "reason": "stale_version",
       "server_version": 5, "server_payload": { ... } }
  ],
  "tombstones": [ "uuidv7-deleted-on-server" ],
  "pull_url":   "/api/v1/sync/pull?cursor=..."   // for fetching server-side changes
}
```

### Conflict resolution rules (per entity)

| Entity | Strategy |
|--------|----------|
| `activity_progress`, `indicator_value` | **Last-writer-wins with audit** — keep both in `*_history`, surface conflict to district M&E for reconciliation |
| `report_submission` | **Server wins after approval** — once approved, mobile edits are rejected and user notified |
| `budget_line`, `disbursement` | **Server-authoritative** — mobile is read-only for finance |
| `evidence_file` | **Additive** — uploads never conflict, deletes require explicit user action |
| `plan_activity` (definition) | **Server-authoritative** — only HQ/directorate edits; mobile sees latest pulled version |

### Evidence files (photos, PDFs)

- Stored locally on device until upload window.
- Uploaded via **resumable multipart** to S3/MinIO using pre-signed URLs.
- The metadata record references the S3 key; the file upload and metadata sync are independent so a slow photo upload never blocks form submission.

### Bandwidth and battery awareness

- Sync is **chunked** (default 50 records per request) and respects an exponential backoff.
- The app exposes a "Sync now" control but otherwise syncs opportunistically when Wi-Fi is detected.
- Background sync uses Expo TaskManager with battery-aware constraints.

---

## 5. Security architecture

### Identity

- **Keycloak** as the OIDC identity provider, deployed inside the VPC.
- Supports SSO with government identity providers (when available), MFA (TOTP / WebAuthn), and password policies aligned with the Public Service ICT standards.
- JWT access tokens (15 min) + refresh tokens (rotating, 7 days) stored in `expo-secure-store` on mobile and HTTP-only cookies on web.

### Authorisation

- **RBAC with a thin ABAC layer for scope.**
  - Roles: `super_admin`, `ministry_executive`, `directorate_head`, `programme_manager`, `me_officer`, `finance_officer`, `district_user`, `facility_user`, `donor_viewer`, `auditor`.
  - Each role has a set of **permissions** (e.g. `planning.awp.approve`, `budget.line.edit`).
  - Each user has an **organisational scope** (`directorate_id`, `district_id`, `facility_id`, `programme_ids[]`) enforced as a row-level predicate on every query.
- Enforcement happens in **three** layers (defence in depth):
  1. Router decorator: `@require(permission="planning.awp.approve", scope="directorate")`
  2. Service-layer check against the scoped query builder.
  3. **PostgreSQL row-level security (RLS)** policies as the last line of defence — even a buggy service cannot leak cross-directorate data.

### Data protection

- Encryption in transit: TLS 1.3 everywhere; mTLS inside the cluster.
- Encryption at rest: RDS storage encrypted with KMS; S3 bucket encryption with SSE-KMS; field-level encryption for PII (personal identifiers in HR records) using `pgcrypto`.
- Secrets: Vault or AWS Secrets Manager; no secrets in env files committed to git.
- Backups: nightly logical + continuous WAL archiving (PITR to 5 minutes); monthly DR drill restoring to an isolated environment.

### Audit

- **Every mutation** writes an immutable audit record to `audit.event_log` with `actor_id`, `actor_role`, `entity`, `entity_id`, `before`, `after`, `ip`, `device_id`, `request_id`.
- Audit data is append-only (revoked UPDATE/DELETE for everyone except a quarterly archival job).
- Hash-chained: each row contains `prev_hash = sha256(prev_row || this_row_payload)` so tampering is detectable.
- Audit log access itself is logged.

### Threat model highlights

| Threat | Mitigation |
|--------|------------|
| Stolen mobile device | Device-bound refresh tokens, remote wipe via Keycloak, local DB encryption (SQLCipher) |
| Insider data exfiltration | RLS, audit chain, donor/auditor read-only roles, export rate limits |
| DHIS2 credential leak | Per-environment service accounts in Vault, rotation policy, network-restricted egress |
| Ransomware on edge node | Read-only replica only; central is authoritative; daily snapshot to immutable storage |
| API abuse / scraping | API gateway rate limits, mTLS for service-to-service, signed sync envelopes |

---

## 6. Observability

- **Logs:** structured JSON to stdout → Fluent Bit → Loki (or CloudWatch Logs). Every log line carries `request_id`, `user_id`, `tenant_scope`.
- **Metrics:** Prometheus scrape; RED (rate / errors / duration) per endpoint and per Celery task; business metrics (e.g., `awp_submissions_total`) as custom Prometheus counters.
- **Traces:** OpenTelemetry SDK in FastAPI and the workers; exported to Tempo or AWS X-Ray.
- **Errors:** Sentry for both web and mobile; release-tagged.
- **Synthetic checks:** Uptime probes from multiple geographic points hitting `/healthz`.
- **SLOs:**
  - API availability ≥ 99.5% / month (excluding planned maintenance).
  - p95 API latency ≤ 800 ms for read endpoints; ≤ 2 s for sync push.
  - Mobile sync success rate ≥ 99% within 24 h of connectivity.

---

## 7. Cross-cutting concerns

### Internationalisation

- English (primary), Krio (transliteration), French (for cross-border / WHO reporting).
- Strings in JSON resource files; ICU MessageFormat for plural/gender.
- The **content model** is i18n-aware: indicator names, pillar titles, etc. have `name_en`, `name_kri`, `name_fr` columns.

### Accessibility

- WCAG 2.1 AA targets on web.
- Mobile uses native components for screen-reader support; large-touch-target Tailwind variants for tablet users.

### Data quality

- Validation at every layer (Pydantic on API, Zod on web, runtime checks on mobile).
- **Data quality service** runs scheduled rules (completeness, consistency, outlier detection) on indicator submissions and flags anomalies in dashboards.

### AI integration (preview — full design in module doc)

The platform exposes a thin **AI service** module with three initial use cases:

1. **Anomaly detection on indicator submissions** — z-score / seasonal decomposition; flags suspicious values for M&E review.
2. **Forecasting** — simple ARIMA / Prophet models on key indicators (e.g. ANC visits, ITN distribution) to support planning.
3. **Narrative drafting** — a constrained LLM (self-hosted Llama 3 or Mistral via vLLM, or a tightly-scoped API call to a sovereign-region LLM) drafts narrative report sections from structured data; humans review and edit.

All AI outputs are **explainable** (model name, inputs, confidence) and **never auto-published** — they always require human approval.

---

## 8. Architectural Decision Records (ADRs)

Every significant decision is captured as an ADR in `docs/adr/NNNN-title.md`.
The initial set to be written before MVP code freeze:

- ADR-0001: Modular monolith over microservices
- ADR-0002: Single PostgreSQL with extensions over polyglot persistence
- ADR-0003: FastAPI + Pydantic v2 as the API platform
- ADR-0004: Next.js App Router with SSR for low-bandwidth users
- ADR-0005: React Native + Expo with WatermelonDB for offline
- ADR-0006: Keycloak as the OIDC provider
- ADR-0007: UUIDv7 client-generated IDs with server-side validation
- ADR-0008: PostgreSQL Row-Level Security as the authorisation backstop
- ADR-0009: Hash-chained audit log over external audit service
- ADR-0010: Sync protocol versioning and conflict policy
- ADR-0011: District edge nodes for chronically offline regions
- ADR-0012: Sovereign-cloud-first deployment, hyperscaler-portable

---

**Next:** [02 — System modules](02-system-modules.md)
