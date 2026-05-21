# 03 — Database Schema

This document defines the **core PostgreSQL schema** for NHPMBR. It is the
single source of truth that all modules must implement and that the API
contracts will mirror.

We use one PostgreSQL 16 cluster with the extensions:
`uuid-ossp`, `pgcrypto`, `pg_trgm`, `postgis`, `pgvector`, `btree_gin`,
`pg_stat_statements`.

Each module lives in its own **PostgreSQL schema** (namespace), e.g. `iam`,
`org`, `planning`, `budget`, `me`, `report`, `workflow`, `audit`. This gives
us module isolation, easier permissioning, and a clean path to extract a
module into its own database later if needed.

---

## Conventions

These conventions are **mandatory** for every table.

| Convention | Rule |
|------------|------|
| Primary keys | `id UUID PRIMARY KEY DEFAULT uuid_generate_v7()` (UUIDv7, sortable) |
| Foreign keys | `<entity>_id UUID NOT NULL REFERENCES <schema>.<table>(id)` |
| Timestamps | `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` |
| Soft delete | `deleted_at TIMESTAMPTZ NULL`; queries filter via a view or RLS predicate |
| Versioning | `version INTEGER NOT NULL DEFAULT 1` — incremented on every UPDATE via trigger; used by optimistic concurrency control |
| Audit metadata | `created_by UUID NOT NULL REFERENCES iam.users(id)`, `updated_by UUID NOT NULL REFERENCES iam.users(id)` |
| Money | `NUMERIC(18,2)` for amounts; never `FLOAT` |
| Money + currency | A money column is **always** accompanied by `currency_code CHAR(3)` (ISO 4217) |
| Multi-language strings | Columns suffixed `_en`, `_kri`, `_fr` (sparse — only labels that need translation) |
| Enums | Postgres `ENUM` types only for stable, low-cardinality sets; otherwise use a lookup table |
| Triggers | `set_updated_at()`, `bump_version()`, `emit_audit_event()` attached to every business table |
| Indexes | At least one on every FK; composite indexes follow query patterns documented inline |
| Constraints | All business invariants enforced by `CHECK` constraints, not just by application code |
| RLS | Enabled on every table holding scoped data; default deny |

---

## Schema overview (logical ERD)

```
                                     ┌──────────────────────┐
                                     │   iam.users          │
                                     │   iam.roles          │
                                     │   iam.user_scopes    │──┐
                                     └──────────────────────┘  │ scoped on
                                                               ▼
   ┌────────────────────┐    ┌────────────────────┐   ┌──────────────────────┐
   │ org.directorates   │◀───│ org.programmes     │   │ org.districts        │
   │                    │    │                    │   │   └─ org.chiefdoms   │
   └─────────┬──────────┘    └─────────┬──────────┘   │        └─ org.phus   │
             │                         │              │             └─ facilities
             ▼                         ▼              └──────────┬───────────┘
   ┌────────────────────┐    ┌────────────────────┐              │
   │ strategy.plans     │───▶│ strategy.pillars   │              │
   │                    │    │  └─ objectives     │              │
   └─────────┬──────────┘    └─────────┬──────────┘              │
             │                         │                          │
             ▼                         ▼                          │
   ┌────────────────────────────────────────────┐                 │
   │ planning.annual_work_plans                 │                 │
   │   ├─ planning.awp_activities ──────────────┼────────────────▶│ executes at district / facility
   │   ├─ planning.awp_outputs                  │                 │
   │   └─ planning.awp_milestones               │                 │
   └─────────┬───────────────────┬──────────────┘                 │
             │                   │                                │
             ▼                   ▼                                │
   ┌────────────────────┐  ┌────────────────────┐                 │
   │ budget.lines       │  │ me.indicators      │◀────────────────┘
   │  ├─ allocations    │  │  ├─ targets        │
   │  └─ expenditures   │  │  └─ values         │
   └─────────┬──────────┘  └─────────┬──────────┘
             │                       │
             ▼                       ▼
   ┌────────────────────┐  ┌────────────────────┐    ┌────────────────────┐
   │ donor.agreements   │  │ activity.progress  │───▶│ doc.documents      │
   │  └─ tranches       │  │                    │    │                    │
   └────────────────────┘  └────────────────────┘    └────────────────────┘

           ▲                                                ▲
           │                                                │
           └────────── report.instances ────────────────────┘
                          │
                          ▼
                   workflow.instances
                          │
                          ▼
                   audit.event_log
```

---

## Core tables (DDL)

The DDL below is illustrative — final migrations are produced via Alembic.
Comments explain intent and any non-obvious constraints.

### 1. IAM

```sql
CREATE SCHEMA iam;

CREATE TABLE iam.users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    keycloak_sub    TEXT UNIQUE NOT NULL,           -- OIDC subject from Keycloak
    email           CITEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    phone_e164      TEXT,
    preferred_lang  CHAR(2) NOT NULL DEFAULT 'en',  -- en | kri | fr
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    mfa_enrolled    BOOLEAN NOT NULL DEFAULT FALSE,
    -- standard audit columns
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE iam.roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                -- e.g. 'directorate_head'
    name        TEXT NOT NULL,
    description TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE       -- system roles can't be deleted
);

CREATE TABLE iam.permissions (
    id     UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code   TEXT UNIQUE NOT NULL,                     -- 'planning.awp.approve'
    domain TEXT NOT NULL,                            -- 'planning'
    entity TEXT NOT NULL,                            -- 'awp'
    action TEXT NOT NULL                             -- 'approve'
);

CREATE TABLE iam.role_permissions (
    role_id       UUID NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES iam.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.user_roles (
    user_id     UUID NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
    role_id     UUID NOT NULL REFERENCES iam.roles(id),
    granted_by  UUID NOT NULL REFERENCES iam.users(id),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- Organisational scope: defines what slice of data a user can see/edit.
-- A user can have many scopes; they are OR'd at query time.
CREATE TABLE iam.user_scopes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id         UUID NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
    scope_type      TEXT NOT NULL CHECK (scope_type IN
                      ('global','directorate','programme','district','facility','funding_source')),
    scope_ref_id    UUID NOT NULL,                   -- references the appropriate table
    UNIQUE (user_id, scope_type, scope_ref_id)
);

CREATE INDEX ix_user_scopes_lookup ON iam.user_scopes(user_id, scope_type);
```

**Notes:**
- `keycloak_sub` is the link to the OIDC identity; we never store passwords here.
- Permissions are seeded from a YAML file and reconciled on every deploy.
- `user_scopes` is the **single source of truth** for what a user can access — RLS policies on data tables join to it.

---

### 2. Organisational Structure

```sql
CREATE SCHEMA org;

CREATE TABLE org.directorates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                -- 'DPPI', 'DPHA', 'DHS'
    name        TEXT NOT NULL,
    parent_id   UUID REFERENCES org.directorates(id),
    head_user_id UUID REFERENCES iam.users(id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from  DATE NOT NULL,
    valid_to    DATE                                  -- NULL = currently valid
);

CREATE TABLE org.programmes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code            TEXT UNIQUE NOT NULL,             -- 'EPI', 'HSS', 'MAL'
    name            TEXT NOT NULL,
    directorate_id  UUID NOT NULL REFERENCES org.directorates(id),
    manager_user_id UUID REFERENCES iam.users(id),
    description     TEXT
);

CREATE TABLE org.districts (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code          TEXT UNIQUE NOT NULL,               -- ISO-aligned where possible
    name          TEXT NOT NULL,
    region        TEXT NOT NULL,
    geometry      GEOMETRY(MultiPolygon, 4326),
    population    INTEGER,
    valid_from    DATE NOT NULL,
    valid_to      DATE
);

CREATE INDEX ix_districts_geom ON org.districts USING GIST (geometry);

CREATE TABLE org.chiefdoms (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    district_id UUID NOT NULL REFERENCES org.districts(id),
    geometry    GEOMETRY(MultiPolygon, 4326)
);

CREATE TABLE org.facilities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code            TEXT UNIQUE NOT NULL,             -- MFL code
    name            TEXT NOT NULL,
    facility_type   TEXT NOT NULL,                    -- CHP, CHC, MCHP, hospital_district, hospital_referral, etc.
    ownership       TEXT NOT NULL,                    -- public, mission, private, ngo
    chiefdom_id     UUID REFERENCES org.chiefdoms(id),
    district_id     UUID NOT NULL REFERENCES org.districts(id),
    location        GEOMETRY(Point, 4326),
    catchment       GEOMETRY(MultiPolygon, 4326),
    in_charge_user_id UUID REFERENCES iam.users(id),
    is_operational  BOOLEAN NOT NULL DEFAULT TRUE,
    closed_at       TIMESTAMPTZ,
    dhis2_uid       TEXT                              -- for DHIS2 integration mapping
);

CREATE INDEX ix_facilities_district ON org.facilities(district_id);
CREATE INDEX ix_facilities_location ON org.facilities USING GIST (location);
CREATE INDEX ix_facilities_name_trgm ON org.facilities USING GIN (name gin_trgm_ops);
```

**Notes:**
- `valid_from` / `valid_to` on directorates and districts give us **historical org changes**. Reports query "the directorate of record on date X" via these dates.
- `dhis2_uid` everywhere external IDs are needed — populated by the Integration Hub.
- PostGIS geometries in WGS84 (SRID 4326); we use GIST indexes for spatial queries.

---

### 3. Master Data

```sql
CREATE SCHEMA mdm;

CREATE TABLE mdm.fiscal_years (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code      TEXT UNIQUE NOT NULL,                  -- 'FY2026'
    starts_on DATE NOT NULL,
    ends_on   DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (ends_on > starts_on)
);

CREATE TABLE mdm.currencies (
    code    CHAR(3) PRIMARY KEY,                     -- 'SLE', 'USD', 'EUR', 'GBP'
    name    TEXT NOT NULL,
    minor_unit SMALLINT NOT NULL DEFAULT 2
);

CREATE TABLE mdm.indicator_definitions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code            TEXT UNIQUE NOT NULL,            -- 'ANC4_COVERAGE'
    name_en         TEXT NOT NULL,
    name_kri        TEXT,
    description     TEXT,
    data_type       TEXT NOT NULL CHECK (data_type IN ('integer','decimal','percentage','rate','count','ratio','text','boolean')),
    unit            TEXT,                            -- '%', 'per 1000', 'visits'
    direction       TEXT NOT NULL CHECK (direction IN ('higher_better','lower_better','target_based')),
    default_disaggregation TEXT[] DEFAULT ARRAY['total','sex','age_group','district']::TEXT[],
    fhir_code       TEXT,                            -- mapping to FHIR ValueSet
    dhis2_uid       TEXT,                            -- DHIS2 data element UID
    version         INTEGER NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE mdm.disaggregation_categories (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code    TEXT UNIQUE NOT NULL,                    -- 'sex', 'age_group_who'
    name    TEXT NOT NULL,
    options JSONB NOT NULL                           -- e.g. ["male","female","other"]
);
```

---

### 4. Strategy

```sql
CREATE SCHEMA strategy;

CREATE TABLE strategy.plans (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                -- 'NHSP_2026_2030'
    name        TEXT NOT NULL,
    starts_on   DATE NOT NULL,
    ends_on     DATE NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('draft','approved','published','superseded','archived')),
    approved_by UUID REFERENCES iam.users(id),
    approved_at TIMESTAMPTZ,
    vision      TEXT,
    mission     TEXT,
    document_id UUID                                  -- pointer to the signed PDF in doc.documents
);

CREATE TABLE strategy.pillars (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    plan_id   UUID NOT NULL REFERENCES strategy.plans(id) ON DELETE CASCADE,
    code      TEXT NOT NULL,                          -- 'P1', 'P2'
    name      TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    UNIQUE (plan_id, code)
);

CREATE TABLE strategy.objectives (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    pillar_id    UUID NOT NULL REFERENCES strategy.pillars(id) ON DELETE CASCADE,
    code         TEXT NOT NULL,                       -- 'P1.O3'
    name         TEXT NOT NULL,
    description  TEXT,
    owner_directorate_id UUID REFERENCES org.directorates(id),
    outcome_indicator_id UUID REFERENCES mdm.indicator_definitions(id),
    UNIQUE (pillar_id, code)
);

CREATE INDEX ix_objectives_pillar ON strategy.objectives(pillar_id);
CREATE INDEX ix_objectives_owner ON strategy.objectives(owner_directorate_id);
```

---

### 5. Planning (AWP)

```sql
CREATE SCHEMA planning;

CREATE TABLE planning.annual_work_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    fiscal_year_id  UUID NOT NULL REFERENCES mdm.fiscal_years(id),
    directorate_id  UUID NOT NULL REFERENCES org.directorates(id),
    status          TEXT NOT NULL CHECK (status IN
                      ('draft','submitted','under_review','revisions_requested','approved','active','closed')),
    submitted_at    TIMESTAMPTZ,
    approved_at     TIMESTAMPTZ,
    approved_by     UUID REFERENCES iam.users(id),
    total_budget    NUMERIC(18,2),                    -- materialized for fast list views; reconciled by trigger
    currency_code   CHAR(3) NOT NULL DEFAULT 'SLE' REFERENCES mdm.currencies(code),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1,
    UNIQUE (fiscal_year_id, directorate_id)           -- one AWP per directorate per FY
);

CREATE TABLE planning.awp_activities (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    awp_id              UUID NOT NULL REFERENCES planning.annual_work_plans(id) ON DELETE CASCADE,
    objective_id        UUID NOT NULL REFERENCES strategy.objectives(id),
    programme_id        UUID REFERENCES org.programmes(id),
    code                TEXT NOT NULL,                -- 'A.1.2.3'
    title               TEXT NOT NULL,
    description         TEXT,
    owner_org_id        UUID NOT NULL,                -- usually directorate or programme
    executor_org_id     UUID,                          -- often a district
    executor_org_type   TEXT CHECK (executor_org_type IN ('directorate','programme','district','facility')),
    starts_on           DATE NOT NULL,
    ends_on             DATE NOT NULL,
    expected_output     TEXT,
    status              TEXT NOT NULL CHECK (status IN ('planned','in_progress','delayed','completed','cancelled')),
    progress_pct        SMALLINT CHECK (progress_pct BETWEEN 0 AND 100),
    CHECK (ends_on >= starts_on),
    UNIQUE (awp_id, code)
);

CREATE INDEX ix_awp_activities_awp ON planning.awp_activities(awp_id);
CREATE INDEX ix_awp_activities_objective ON planning.awp_activities(objective_id);
CREATE INDEX ix_awp_activities_executor ON planning.awp_activities(executor_org_id, executor_org_type);
CREATE INDEX ix_awp_activities_period ON planning.awp_activities(starts_on, ends_on);

CREATE TABLE planning.awp_outputs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    activity_id     UUID NOT NULL REFERENCES planning.awp_activities(id) ON DELETE CASCADE,
    code            TEXT NOT NULL,
    description     TEXT NOT NULL,
    target_value    NUMERIC,
    target_unit     TEXT,
    indicator_id    UUID REFERENCES mdm.indicator_definitions(id),
    UNIQUE (activity_id, code)
);

CREATE TABLE planning.awp_milestones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    activity_id     UUID NOT NULL REFERENCES planning.awp_activities(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    due_date        DATE NOT NULL,
    achieved_at     DATE,
    status          TEXT NOT NULL CHECK (status IN ('pending','on_track','at_risk','overdue','achieved','missed'))
);
```

---

### 6. Budget

```sql
CREATE SCHEMA budget;

CREATE TABLE budget.funding_sources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code            TEXT UNIQUE NOT NULL,             -- 'GOSL', 'GAVI', 'GFATM', 'WB-HSS'
    name            TEXT NOT NULL,
    source_type     TEXT NOT NULL CHECK (source_type IN ('government','bilateral','multilateral','foundation','ngo','private')),
    donor_id        UUID                              -- nullable; references donor.donors
);

CREATE TABLE budget.chart_of_accounts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                 -- aligned with IFMIS COA
    name        TEXT NOT NULL,
    parent_id   UUID REFERENCES budget.chart_of_accounts(id),
    level       SMALLINT NOT NULL,
    is_leaf     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE budget.lines (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    awp_activity_id    UUID NOT NULL REFERENCES planning.awp_activities(id),
    funding_source_id  UUID NOT NULL REFERENCES budget.funding_sources(id),
    coa_id             UUID NOT NULL REFERENCES budget.chart_of_accounts(id),
    fiscal_year_id     UUID NOT NULL REFERENCES mdm.fiscal_years(id),
    allocated_amount   NUMERIC(18,2) NOT NULL CHECK (allocated_amount >= 0),
    currency_code      CHAR(3) NOT NULL REFERENCES mdm.currencies(code),
    fx_rate_to_base    NUMERIC(18,8) NOT NULL,        -- frozen at line creation
    base_amount        NUMERIC(18,2) GENERATED ALWAYS AS (allocated_amount * fx_rate_to_base) STORED,
    notes              TEXT,
    UNIQUE (awp_activity_id, funding_source_id, coa_id, fiscal_year_id)
);

CREATE INDEX ix_budget_lines_activity ON budget.lines(awp_activity_id);
CREATE INDEX ix_budget_lines_funding ON budget.lines(funding_source_id);
CREATE INDEX ix_budget_lines_fy ON budget.lines(fiscal_year_id);

CREATE TABLE budget.expenditures (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    budget_line_id  UUID NOT NULL REFERENCES budget.lines(id),
    txn_date        DATE NOT NULL,
    amount          NUMERIC(18,2) NOT NULL CHECK (amount > 0),
    currency_code   CHAR(3) NOT NULL REFERENCES mdm.currencies(code),
    fx_rate_to_base NUMERIC(18,8) NOT NULL,
    base_amount     NUMERIC(18,2) GENERATED ALWAYS AS (amount * fx_rate_to_base) STORED,
    description     TEXT,
    source          TEXT NOT NULL CHECK (source IN ('manual','ifmis','import')),
    external_ref    TEXT,                              -- IFMIS voucher number etc.
    document_id     UUID                               -- supporting document
);

CREATE INDEX ix_expenditures_line ON budget.expenditures(budget_line_id);
CREATE INDEX ix_expenditures_date ON budget.expenditures(txn_date);
```

**Notes:**
- `base_amount` is a `GENERATED ALWAYS` column — no application code can introduce drift.
- The `UNIQUE` constraint on `budget.lines` enforces "one line per activity × funding source × COA × fiscal year".
- Variance is computed via a view, never stored:
  ```sql
  CREATE VIEW budget.line_balances AS
  SELECT l.id AS budget_line_id,
         l.allocated_amount,
         COALESCE(SUM(e.amount), 0) AS expended,
         l.allocated_amount - COALESCE(SUM(e.amount), 0) AS remaining
    FROM budget.lines l LEFT JOIN budget.expenditures e ON e.budget_line_id = l.id
   GROUP BY l.id;
  ```

---

### 7. Donor & Funding

```sql
CREATE SCHEMA donor;

CREATE TABLE donor.donors (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                 -- 'WB', 'GFATM', 'GAVI'
    name        TEXT NOT NULL,
    country     CHAR(2),
    contact_email TEXT,
    notes       TEXT
);

CREATE TABLE donor.agreements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    donor_id        UUID NOT NULL REFERENCES donor.donors(id),
    title           TEXT NOT NULL,
    starts_on       DATE NOT NULL,
    ends_on         DATE NOT NULL,
    total_committed NUMERIC(18,2) NOT NULL,
    currency_code   CHAR(3) NOT NULL REFERENCES mdm.currencies(code),
    funding_source_id UUID NOT NULL REFERENCES budget.funding_sources(id),
    document_id     UUID                               -- signed agreement
);

CREATE TABLE donor.tranches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    agreement_id    UUID NOT NULL REFERENCES donor.agreements(id) ON DELETE CASCADE,
    sequence_no     SMALLINT NOT NULL,
    amount          NUMERIC(18,2) NOT NULL,
    currency_code   CHAR(3) NOT NULL REFERENCES mdm.currencies(code),
    expected_date   DATE NOT NULL,
    received_date   DATE,
    status          TEXT NOT NULL CHECK (status IN ('pending','received','partial','overdue','cancelled')),
    UNIQUE (agreement_id, sequence_no)
);
```

---

### 8. M&E / Indicators

```sql
CREATE SCHEMA me;

-- An "indicator" here is an instance of an indicator definition attached
-- to a plan, programme, or AWP for a specific period.
CREATE TABLE me.indicators (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    definition_id   UUID NOT NULL REFERENCES mdm.indicator_definitions(id),
    plan_id         UUID REFERENCES strategy.plans(id),
    objective_id    UUID REFERENCES strategy.objectives(id),
    programme_id    UUID REFERENCES org.programmes(id),
    awp_activity_id UUID REFERENCES planning.awp_activities(id),
    baseline_value  NUMERIC,
    baseline_year   INTEGER,
    frequency       TEXT NOT NULL CHECK (frequency IN ('monthly','quarterly','semi_annual','annual')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (
        (plan_id IS NOT NULL)::int + (objective_id IS NOT NULL)::int +
        (programme_id IS NOT NULL)::int + (awp_activity_id IS NOT NULL)::int >= 1
    )
);

CREATE TABLE me.indicator_targets (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    indicator_id  UUID NOT NULL REFERENCES me.indicators(id) ON DELETE CASCADE,
    fiscal_year_id UUID NOT NULL REFERENCES mdm.fiscal_years(id),
    period        TEXT NOT NULL,                       -- 'FY2026', 'FY2026-Q3', etc.
    target_value  NUMERIC NOT NULL,
    set_by        UUID NOT NULL REFERENCES iam.users(id),
    set_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (indicator_id, period)
);

CREATE TABLE me.indicator_values (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    indicator_id    UUID NOT NULL REFERENCES me.indicators(id),
    period          TEXT NOT NULL,                     -- aligned with frequency
    reporting_org_type TEXT NOT NULL CHECK (reporting_org_type IN ('national','directorate','programme','district','facility')),
    reporting_org_id   UUID NOT NULL,
    value           NUMERIC NOT NULL,
    numerator       NUMERIC,
    denominator     NUMERIC,
    source          TEXT NOT NULL CHECK (source IN ('manual','dhis2','survey','ai_estimate','import')),
    source_ref      TEXT,
    quality_score   SMALLINT CHECK (quality_score BETWEEN 0 AND 100),
    submitted_by    UUID NOT NULL REFERENCES iam.users(id),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    verified_by     UUID REFERENCES iam.users(id),
    verified_at     TIMESTAMPTZ,
    is_revision     BOOLEAN NOT NULL DEFAULT FALSE,
    supersedes_id   UUID REFERENCES me.indicator_values(id),
    UNIQUE (indicator_id, period, reporting_org_type, reporting_org_id, is_revision)
) PARTITION BY RANGE (submitted_at);

CREATE TABLE me.indicator_value_disaggregations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    value_id      UUID NOT NULL REFERENCES me.indicator_values(id) ON DELETE CASCADE,
    category      TEXT NOT NULL,                       -- 'sex', 'age_group'
    breakdown     TEXT NOT NULL,                       -- 'female', '15-19'
    value         NUMERIC NOT NULL,
    UNIQUE (value_id, category, breakdown)
);
```

**Notes:**
- `me.indicator_values` is **partitioned by submitted_at** (yearly partitions) because it will be the largest table in the system.
- The `is_revision` + `supersedes_id` columns let us keep the full history of a value while always knowing "what is the current best value for ANC4 in Bombali for Q2-2026?" via a view.

---

### 9. Activity Progress

```sql
CREATE SCHEMA activity;

CREATE TABLE activity.progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    awp_activity_id UUID NOT NULL REFERENCES planning.awp_activities(id),
    period          TEXT NOT NULL,                     -- 'FY2026-Q3'
    reporting_org_type TEXT NOT NULL,
    reporting_org_id   UUID NOT NULL,
    progress_pct    SMALLINT NOT NULL CHECK (progress_pct BETWEEN 0 AND 100),
    status_note     TEXT,
    blockers        TEXT,
    submitted_by    UUID NOT NULL REFERENCES iam.users(id),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    device_id       UUID,                              -- if submitted via mobile
    client_id       UUID,                              -- UUIDv7 from offline client
    UNIQUE (awp_activity_id, period, reporting_org_type, reporting_org_id)
);

CREATE TABLE activity.output_achievements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    output_id       UUID NOT NULL REFERENCES planning.awp_outputs(id),
    period          TEXT NOT NULL,
    achieved_value  NUMERIC NOT NULL,
    notes           TEXT,
    evidence_doc_id UUID,
    submitted_by    UUID NOT NULL REFERENCES iam.users(id),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 10. Documents

```sql
CREATE SCHEMA doc;

CREATE TABLE doc.documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    name            TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    size_bytes      BIGINT NOT NULL,
    content_sha256  CHAR(64) NOT NULL,
    storage_key     TEXT NOT NULL,                     -- S3 / MinIO object key
    storage_bucket  TEXT NOT NULL,
    uploaded_by     UUID NOT NULL REFERENCES iam.users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    virus_scanned_at TIMESTAMPTZ,
    virus_scan_result TEXT,                            -- 'clean', 'infected', NULL
    -- polymorphic linkage to source entity
    linked_entity   TEXT NOT NULL,                     -- 'awp_activity', 'report_instance', 'budget_expenditure', ...
    linked_entity_id UUID NOT NULL,
    tags            TEXT[] DEFAULT '{}',
    sensitivity     TEXT NOT NULL DEFAULT 'internal'
                      CHECK (sensitivity IN ('public','internal','restricted','confidential'))
);

CREATE INDEX ix_documents_linked ON doc.documents(linked_entity, linked_entity_id);
CREATE INDEX ix_documents_hash ON doc.documents(content_sha256);
CREATE INDEX ix_documents_tags ON doc.documents USING GIN (tags);
```

**Notes:**
- The `linked_entity` / `linked_entity_id` pair is a deliberate polymorphic association. The application enforces validity; we do not use FK to keep flexibility.
- `content_sha256` lets us **deduplicate** identical uploads (a common pattern when the same evidence is attached to multiple reports).

---

### 11. Reporting

```sql
CREATE SCHEMA report;

CREATE TABLE report.templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                  -- 'DISTRICT_QUARTERLY'
    name        TEXT NOT NULL,
    version     INTEGER NOT NULL,
    spec        JSONB NOT NULL,                        -- the DSL definition
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (code, version)
);

CREATE TABLE report.instances (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    template_id     UUID NOT NULL REFERENCES report.templates(id),
    period          TEXT NOT NULL,
    reporting_org_type TEXT NOT NULL,
    reporting_org_id   UUID NOT NULL,
    status          TEXT NOT NULL CHECK (status IN ('draft','submitted','under_review','revisions_requested','approved','published')),
    data_snapshot   JSONB NOT NULL,                    -- frozen at submission time
    narrative       JSONB NOT NULL,                    -- per-section narrative text
    ai_assisted     BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      UUID NOT NULL REFERENCES iam.users(id),
    submitted_by    UUID REFERENCES iam.users(id),
    submitted_at    TIMESTAMPTZ,
    approved_by     UUID REFERENCES iam.users(id),
    approved_at     TIMESTAMPTZ,
    pdf_document_id UUID,                              -- the rendered PDF
    UNIQUE (template_id, period, reporting_org_type, reporting_org_id)
);

CREATE INDEX ix_report_instances_org ON report.instances(reporting_org_type, reporting_org_id, period);
```

---

### 12. Workflow

```sql
CREATE SCHEMA workflow;

CREATE TABLE workflow.definitions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    code        TEXT UNIQUE NOT NULL,                  -- 'awp_approval_v1'
    name        TEXT NOT NULL,
    version     INTEGER NOT NULL,
    spec        JSONB NOT NULL,                        -- declarative state machine
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (code, version)
);

CREATE TABLE workflow.instances (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    definition_id   UUID NOT NULL REFERENCES workflow.definitions(id),
    target_type     TEXT NOT NULL,                     -- 'awp', 'report_instance', 'budget_change_request'
    target_id       UUID NOT NULL,
    current_state   TEXT NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    initiated_by    UUID NOT NULL REFERENCES iam.users(id),
    UNIQUE (target_type, target_id)
);

CREATE TABLE workflow.tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    instance_id     UUID NOT NULL REFERENCES workflow.instances(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    assignee_user_id UUID REFERENCES iam.users(id),
    assignee_role_id UUID REFERENCES iam.roles(id),
    state           TEXT NOT NULL CHECK (state IN ('pending','in_progress','completed','skipped','rejected','reassigned')),
    due_at          TIMESTAMPTZ,
    completed_by    UUID REFERENCES iam.users(id),
    completed_at    TIMESTAMPTZ,
    outcome         TEXT,                              -- 'approved', 'rejected', 'returned'
    comment         TEXT
);

CREATE INDEX ix_workflow_tasks_assignee ON workflow.tasks(assignee_user_id, state);
```

---

### 13. Audit

```sql
CREATE SCHEMA audit;

CREATE TABLE audit.event_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    sequence_no     BIGSERIAL NOT NULL,                -- monotonic
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_user_id   UUID REFERENCES iam.users(id),
    actor_role      TEXT,
    actor_ip        INET,
    actor_device_id UUID,
    action          TEXT NOT NULL,                     -- 'create','update','delete','approve','sign_in','export', etc.
    entity_schema   TEXT NOT NULL,
    entity_table    TEXT NOT NULL,
    entity_id       UUID,
    before_state    JSONB,
    after_state     JSONB,
    request_id      UUID,
    prev_hash       CHAR(64),
    row_hash        CHAR(64) NOT NULL
) PARTITION BY RANGE (occurred_at);

CREATE INDEX ix_audit_entity ON audit.event_log (entity_schema, entity_table, entity_id);
CREATE INDEX ix_audit_actor ON audit.event_log (actor_user_id, occurred_at);

-- Hash chain enforced at write time by a trigger:
-- row_hash = sha256(prev_hash || occurred_at || actor_user_id || action || entity_id || after_state)

-- Lock down updates and deletes
REVOKE UPDATE, DELETE ON audit.event_log FROM PUBLIC;
```

---

### 14. Sync

```sql
CREATE SCHEMA sync;

CREATE TABLE sync.devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id         UUID NOT NULL REFERENCES iam.users(id),
    device_label    TEXT NOT NULL,
    platform        TEXT NOT NULL CHECK (platform IN ('ios','android','web','edge_node')),
    app_version     TEXT NOT NULL,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at    TIMESTAMPTZ,
    public_key      TEXT,                              -- for signed sync envelopes
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sync.envelopes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    device_id       UUID NOT NULL REFERENCES sync.devices(id),
    received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    client_clock    BIGINT NOT NULL,
    server_seq      BIGINT NOT NULL,
    ops_count       INTEGER NOT NULL,
    accepted_count  INTEGER NOT NULL,
    conflict_count  INTEGER NOT NULL,
    payload         JSONB NOT NULL                     -- the envelope as received (for replay/debug)
);

CREATE INDEX ix_sync_envelopes_device ON sync.envelopes(device_id, received_at);

CREATE TABLE sync.conflicts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    envelope_id     UUID NOT NULL REFERENCES sync.envelopes(id),
    entity          TEXT NOT NULL,
    entity_id       UUID NOT NULL,
    reason          TEXT NOT NULL,
    client_payload  JSONB NOT NULL,
    server_payload  JSONB NOT NULL,
    resolved_by     UUID REFERENCES iam.users(id),
    resolved_at     TIMESTAMPTZ,
    resolution      TEXT                                -- 'client_won','server_won','manual_merge'
);
```

---

## Row-Level Security (RLS) example

Every scoped table gets an RLS policy that joins against `iam.user_scopes`.
Example for `planning.awp_activities`:

```sql
ALTER TABLE planning.awp_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY awp_activities_scope_select ON planning.awp_activities
  FOR SELECT
  USING (
       EXISTS (
         SELECT 1 FROM iam.user_scopes s
          WHERE s.user_id = current_setting('app.current_user_id')::uuid
            AND (
                  s.scope_type = 'global'
               OR (s.scope_type = 'directorate' AND s.scope_ref_id =
                      (SELECT directorate_id FROM planning.annual_work_plans
                        WHERE id = planning.awp_activities.awp_id))
               OR (s.scope_type = 'programme' AND s.scope_ref_id = planning.awp_activities.programme_id)
               OR (s.scope_type = 'district' AND s.scope_ref_id = planning.awp_activities.executor_org_id
                   AND planning.awp_activities.executor_org_type = 'district')
            )
       )
  );
```

The API sets `SET LOCAL app.current_user_id = ...` at the start of every request transaction. **Even if a developer writes a buggy query without a WHERE clause, the database will not return data the user is not entitled to.**

---

## Indexing strategy (summary)

- **B-tree** on every foreign key, plus composite indexes that match the dominant query patterns documented inline.
- **GIN (trigram)** for fuzzy name search on `facilities.name`, `users.full_name`, `indicator_definitions.name_en`, document file names.
- **GIST** for all PostGIS geometry columns.
- **HNSW (pgvector)** on `documents.embedding` (post-MVP) for semantic search.
- **Partial indexes** for hot subsets (e.g. `WHERE deleted_at IS NULL`, `WHERE status='active'`).
- **Partitioning:** `me.indicator_values`, `activity.progress`, `audit.event_log` partitioned by year on the relevant time column. Old partitions are detached and archived to cold storage after 7 years.

---

## Backup & retention

| Asset | Backup | Retention | DR target |
|-------|--------|-----------|-----------|
| PostgreSQL | Continuous WAL archive (pgBackRest) + nightly full | 7 years (planning, budget, audit); 15 years (financial records per government policy) | RPO ≤ 5 min, RTO ≤ 1 h |
| S3 / MinIO | Cross-region replication, versioning enabled, object lock for audit-sensitive buckets | 7 years; legal hold flag for active litigation | RPO ≤ 15 min, RTO ≤ 2 h |
| Keycloak | Daily realm export to encrypted S3 | 1 year | RTO ≤ 4 h (rebuildable from configs) |

---

## Performance targets

| Query class | p50 | p95 |
|-------------|-----|-----|
| Dashboard summary (cached aggregates) | < 100 ms | < 300 ms |
| List endpoints (paginated, scoped) | < 150 ms | < 500 ms |
| Detail endpoints | < 100 ms | < 400 ms |
| AWP approval (multi-table write) | < 300 ms | < 1 s |
| Sync push (50-op envelope) | < 600 ms | < 2 s |
| Report PDF render (async) | < 30 s | < 120 s |

---

**Next:** [04 — Development roadmap](04-development-roadmap.md)
