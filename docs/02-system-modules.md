# 02 — System Modules (Bounded Contexts)

The platform is organised into **24 modules**, each a distinct bounded
context with its own data, services, and routes. Modules communicate **only**
through their public Python interfaces (`modules/<name>/api.py`) and HTTP
contracts — never through cross-schema SQL.

This document defines each module's:
- **Purpose** — what business capability it owns.
- **Owns** — the entities it is the source of truth for.
- **Depends on** — modules whose interfaces it calls.
- **External integrations** — non-platform systems it talks to.
- **MVP / Post-MVP** — what ships in phase 1 vs later.

---

## Module dependency overview

```
                         ┌────────────────────────┐
                         │   IAM   ·   Org Units  │   ← foundation, depended on by all
                         └───────────┬────────────┘
                                     │
            ┌────────────┬───────────┼───────────┬────────────────────┐
            ▼            ▼           ▼           ▼                    ▼
         Strategy    Master      Workflow     Audit            Notifications
            │       Data + GIS      │           ▲                    ▲
            ▼          │            │           │                    │
        Planning ──────┼────────────┼───────────┼────────────────────┤
            │          │            │           │                    │
            ▼          ▼            ▼           │                    │
         Budget    M&E /         Reporting ─────┘                    │
            │     Indicators        │                                │
            ▼          │            ▼                                │
       Donor &    Programmes    Documents/                           │
       Funding        │         Evidence                             │
            │          │            │                                │
            └──────────┴────────────┴────────────────────────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                ▼                    ▼                    ▼
          Dashboards            Integration            AI / Insights
          / Analytics              (DHIS2,
                                  FHIR, IFMIS,
                                  HRIS)
                                     │
                                     ▼
                              Sync (mobile/edge)
```

---

## 1. IAM (Identity & Access Management)

**Purpose:** authenticate users, manage roles, permissions, and organisational scopes.

**Owns:** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_scopes`, `sessions`, `api_keys`, `mfa_factors`.

**Depends on:** Org (for the scopes a user can be assigned).

**External:** Keycloak (OIDC), optional government SSO, email/SMS for OTP.

**MVP:** Full user management, RBAC, scoped queries, JWT lifecycle, MFA optional.
**Post-MVP:** WebAuthn, SCIM provisioning, federation with partner identity providers.

**Key design points:**
- Permissions follow a `domain.entity.action` grammar (e.g. `planning.awp.approve`).
- Scopes are *additive*: a programme manager may have `directorate:DPHA` AND `programme:EPI,HSS`.
- A separate **`auth.policy`** table defines reusable role templates so that creating a new "District M&E Officer" user is a one-click operation.

---

## 2. Organisational Structure

**Purpose:** the canonical hierarchy of the Ministry and the country's health system.

**Owns:** `ministries`, `directorates`, `divisions`, `programmes`, `units`, `districts`, `chiefdoms`, `phus` (peripheral health units), `facilities`, `facility_types`.

**Depends on:** none (foundation).

**External:** MoH HR records for staff postings (optional sync).

**MVP:** Ministry → Directorate → Programme → Unit hierarchy; District → Chiefdom → Facility hierarchy; staff posting linkages.
**Post-MVP:** historical org changes (which unit existed in 2023?), org-chart visualisation.

**Key design points:**
- Two distinct trees: **administrative** (Ministry side) and **geographic** (district/facility side). They join at programmes that have district/facility-level activities.
- All references use stable UUIDs; human-friendly codes (`SL-DIST-WS-FT`) are *attributes*, not keys.
- Soft-close (not hard-delete) — a facility that closes still has historical reports attached to it.

---

## 3. Master Data & Reference

**Purpose:** vocabularies and code lists used across the platform.

**Owns:** `indicator_definitions` (with units, disaggregations), `disaggregation_categories`, `value_sets` (FHIR-aligned), `data_types`, `frequencies`, `funding_source_types`, `currencies`, `fiscal_years`, `geocodes`.

**Depends on:** none.

**External:** WHO Global Health Observatory, ICD-11, DHIS2 metadata (sync).

**MVP:** Indicator dictionary, fiscal years, currencies, basic value sets.
**Post-MVP:** Full FHIR ValueSet alignment, multi-language code lists.

**Key design points:**
- All master data is **versioned** — every change creates a new version row; reports always reference a specific version so historical reports remain reproducible.
- Bulk import via CSV with validation and dry-run mode.

---

## 4. Strategy

**Purpose:** the national strategic framework — the *why* behind every plan.

**Owns:** `strategic_plans` (e.g. "NHSP 2021-2025"), `strategic_pillars`, `strategic_objectives`, `results_areas`, `outcomes`, `theory_of_change_nodes`.

**Depends on:** Org (objectives can be owned by a directorate), Master Data (indicators).

**MVP:** Hierarchical strategic plan with pillars → objectives → outcomes; link to indicators.
**Post-MVP:** Theory-of-change visual editor, cross-plan mapping (NHSP ↔ SDG ↔ UHC).

**Key design points:**
- A strategic plan is **immutable once published**; revisions create a new version.
- Every objective has at least one **outcome indicator** which becomes the rollup metric on the executive dashboard.

---

## 5. Annual Work Planning (AWP)

**Purpose:** translate strategic objectives into yearly directorate plans.

**Owns:** `annual_work_plans`, `awp_activities`, `awp_outputs`, `awp_milestones`, `awp_review_cycles`.

**Depends on:** Strategy (objectives), Org (directorate, programme), Budget (allocation), M&E (target indicators), Workflow (approval).

**MVP:** Create AWP per directorate per fiscal year; activities linked to objectives; output targets; milestone dates; multi-stage approval (programme → directorate → DPPI).
**Post-MVP:** Plan variance analysis, plan-vs-actual heatmaps, mid-year re-planning workflow.

**Key design points:**
- The **AWP is the central planning artefact** of the platform. It is the bridge between Strategy and everything downstream.
- An AWP has a state machine: `draft → submitted → under_review → revisions_requested → approved → active → closed`.
- Activities can be **cross-cutting** (owned by directorate A, executed in districts B, C, D); the model supports this via `executor_org_id` distinct from `owner_org_id`.

---

## 6. Programmes

**Purpose:** vertical programme management (EPI, RMNCH, HIV, TB, Malaria, NCD, etc.) and their cross-cutting projects.

**Owns:** `programme_profiles` (extends Org's `programmes`), `programme_strategies`, `programme_projects`, `project_teams`.

**Depends on:** Org, Strategy, Planning, Budget, M&E.

**MVP:** Programme overview pages aggregating their AWP activities, budgets, and indicator performance.
**Post-MVP:** Per-programme project management (Gantt, RACI), partner mapping.

**Key design points:**
- A "programme" in the Ministry sense is *both* an organisational unit (managed in Org) and a portfolio of work (managed here). The Programmes module is the **view that unifies them**.

---

## 7. Budget & Financial Tracking

**Purpose:** plan, allocate, track, and reconcile budgets and expenditures.

**Owns:** `budgets`, `budget_lines`, `chart_of_accounts`, `allocations`, `commitments`, `expenditures`, `disbursements`, `fx_rates`.

**Depends on:** Org, Planning (lines link to AWP activities), Donor & Funding (funding source per line), Master Data (currencies, fiscal years), Workflow (budget approval).

**External:** IFMIS (Sierra Leone government finance system) for actual expenditure reconciliation.

**MVP:** Budget lines per activity, multi-currency, multi-funding-source, manual expenditure entry.
**Post-MVP:** IFMIS integration, commitment tracking, automated reconciliation, donor-specific COA mapping.

**Key design points:**
- A budget line is uniquely identified by `(awp_activity_id, funding_source_id, coa_code, fiscal_year)`.
- All amounts stored in **base currency** (SLE) with `original_amount`, `original_currency`, `fx_rate`, `fx_date`.
- Variance is a *computed* property (`allocated - expended`), never stored, to avoid drift.

---

## 8. Donor & Funding

**Purpose:** track donor commitments, disbursements, and donor-scoped visibility.

**Owns:** `donors`, `funding_agreements`, `funding_tranches`, `funding_sources`, `donor_reports`.

**Depends on:** Budget (allocations consume funding), Org (whom the donor funds), Reporting (donor reports).

**MVP:** Donor directory, funding agreements with tranches, link to budget lines, donor read-only dashboard.
**Post-MVP:** Donor self-service portal, automated drawdown forecasts, multi-currency reconciliation.

**Key design points:**
- Donor visibility is enforced via IAM scope: a donor user sees only budget lines/activities tagged with their `funding_source_id`.
- All donor exports are **watermarked** and audit-logged.

---

## 9. M&E / Indicators

**Purpose:** define, target, collect, and analyse indicators.

**Owns:** `indicators` (instances of `indicator_definitions` attached to a plan/programme), `indicator_targets`, `indicator_values`, `disaggregated_values`, `data_collection_forms`.

**Depends on:** Master Data (definitions), Strategy, Planning, Org (collected from which level), Documents (evidence).

**External:** DHIS2 (pull aggregate service-delivery indicators), KOBO Toolbox / ODK (survey data).

**MVP:** Indicator dictionary lookup, indicator-target setting per AWP, manual indicator value entry per period, disaggregation by sex/age/district.
**Post-MVP:** Automated DHIS2 pull, survey integrations, data-quality scoring per submission, indicator change requests with audit.

**Key design points:**
- An indicator value is **always** tied to `(indicator_id, period, org_id, source)`. `source` is one of `manual`, `dhis2`, `survey`, `ai_estimate`.
- Disaggregations are stored in a normalised table; the API exposes them as nested JSON for convenience.
- A **data quality score** (0-100) is computed per submission from completeness, timeliness, outlier checks, and provenance.

---

## 10. Activity & Output Tracking

**Purpose:** track implementation progress against planned activities.

**Owns:** `activity_progress`, `output_achievements`, `activity_notes`, `field_visits`.

**Depends on:** Planning (the activity definitions), Documents (evidence), IAM scope, Sync (mobile updates).

**MVP:** Periodic progress updates (% complete, qualitative status), output achievement entry with evidence, mobile-friendly forms.
**Post-MVP:** Automated progress from indicator values, GPS-tagged field visits, photo geotagging.

---

## 11. Milestone & Timeline

**Purpose:** date-based tracking of plan milestones and dependencies.

**Owns:** `milestones`, `milestone_dependencies`, `milestone_status_history`.

**Depends on:** Planning, Activity Tracking.

**MVP:** Milestone list per AWP/programme with traffic-light status.
**Post-MVP:** Gantt visualisation, critical path, dependency-driven re-planning.

---

## 12. Reporting

**Purpose:** structured periodic and ad-hoc reports.

**Owns:** `report_templates`, `report_instances`, `report_sections`, `report_submissions`, `report_signoffs`.

**Depends on:** all data modules (it composes them), Workflow (approval chain), Documents (attachments), AI/Insights (narrative drafting).

**MVP:** District quarterly report, programme quarterly report, directorate annual report; templated sections with auto-filled tables (from M&E, Budget) and free-text narrative; submit-for-review workflow.
**Post-MVP:** Donor-specific report templates, scheduled auto-generation, multilingual reports, e-signature on signoff.

**Key design points:**
- Templates are **DSL-driven** (a JSON spec of sections, data sources, validation), so M&E can author new templates without code changes.
- Each report instance snapshots its data at submission time so a report viewed in 2028 reflects the numbers as known when submitted in 2026.

---

## 13. Documents & Evidence

**Purpose:** secure storage of all supporting files.

**Owns:** `documents`, `document_versions`, `document_tags`, `document_acl`.

**Depends on:** IAM scope, Sync (mobile uploads), all modules that attach evidence.

**External:** S3 / MinIO.

**MVP:** Upload, versioned storage, type/size validation, virus scanning (ClamAV), preview for common formats, link-back to source entity.
**Post-MVP:** OCR + text extraction for search, redaction tools for sensitive PII, retention policies.

**Key design points:**
- Files are referenced by **content hash** to avoid duplication.
- Mobile uploads use **resumable multipart** to S3 directly via pre-signed URLs; the API only receives the metadata.

---

## 14. Workflow & Approvals

**Purpose:** generic, configurable approval workflows.

**Owns:** `workflow_definitions`, `workflow_instances`, `workflow_tasks`, `workflow_actions`, `delegations`.

**Depends on:** IAM (assignees), Notifications.

**MVP:** Linear multi-stage approvals (AWP, budget, reports); reassignment; comments; SLA timers.
**Post-MVP:** Conditional branching, parallel approvals, escalation rules, e-signature.

**Key design points:**
- Workflows are **defined declaratively** in YAML/JSON, version-controlled in `data/workflows/`.
- A workflow instance is tied to **any** entity via a polymorphic `target_type` + `target_id`.

---

## 15. Notifications

**Purpose:** outbound messages across channels.

**Owns:** `notification_templates`, `notification_subscriptions`, `notification_deliveries`, `notification_preferences`.

**Depends on:** IAM (who to notify), Workflow (what to notify about).

**External:** Email (SES or sovereign provider), SMS (Africa's Talking / local MNO), Push (Expo Push), in-app.

**MVP:** Email + in-app notifications for approvals, deadlines, mentions.
**Post-MVP:** SMS for district users without smartphones, WhatsApp/Telegram channels, daily/weekly digests.

---

## 16. Audit & Compliance

**Purpose:** immutable, queryable record of every system action.

**Owns:** `audit.event_log` (hash-chained, append-only), `audit.access_log` (read-only data access for sensitive entities).

**Depends on:** all modules emit to it via a middleware.

**MVP:** Mutation logs for planning, budget, reports, users; UI to browse and filter.
**Post-MVP:** SIEM export, anomaly detection on audit log, signed daily attestations.

---

## 17. Dashboards & Analytics

**Purpose:** purpose-built dashboards per role and per pillar.

**Owns:** `dashboard_definitions`, `saved_views`, `cached_aggregates`.

**Depends on:** all data modules (read-only); Superset/Metabase reads directly from the read replica for self-service analytics.

**MVP:** Executive dashboard (national KPIs), Directorate dashboard, Programme dashboard, District dashboard, Donor dashboard.
**Post-MVP:** Dashboard builder for analysts, scheduled snapshots, alerting on thresholds.

**Key design points:**
- Dashboards are **pre-computed** (materialized views refreshed on a schedule) for performance over the low-bandwidth ALB.
- Each dashboard has a `printable` mode optimised for PDF export and email distribution.

---

## 18. GIS & Mapping

**Purpose:** spatial intelligence — where are facilities, where is need, where is funding going?

**Owns:** `geometries` (PostGIS), `map_layers`, `map_styles`, `heatmap_cells`.

**Depends on:** Org (facilities, districts), M&E (indicator values for choropleths), Budget (allocations per district).

**MVP:** Static map of facilities, district choropleth for selected indicators.
**Post-MVP:** Catchment area analysis, accessibility (travel-time isochrones with OpenRouteService), outbreak hotspot overlays.

---

## 19. Integration Hub

**Purpose:** connectors to external systems, designed as plug-in adapters.

**Owns:** `external_systems`, `integration_mappings`, `sync_jobs`, `sync_log`.

**Depends on:** all modules; each adapter pushes/pulls through the relevant module's interface.

**External adapters (initial):**
- **DHIS2** — pull aggregate indicators, push annual targets.
- **IFMIS** — pull expenditure transactions for budget reconciliation.
- **HRIS / IHRIS** — pull staff postings to keep Org current.
- **FHIR R4 gateway** — expose Patient / Encounter / Observation if/when clinical-system integration is required.
- **KOBO / ODK** — pull survey data into M&E.

**MVP:** DHIS2 pull (indicators), CSV import/export for IFMIS, manual HRIS sync.
**Post-MVP:** Real-time IFMIS sync, FHIR gateway, automated bidirectional flows.

**Key design points:**
- Each adapter is a **separate Python package** under `services/api/app/integrations/`, with its own config, secrets, and retry policy.
- All adapters publish to a single **sync event bus** so observability and audit are uniform.
- Adapters never write directly to module tables — they call the module's public interface, which enforces validation and audit.

---

## 20. Sync (Mobile / Edge)

**Purpose:** the protocol and server endpoint that powers offline-first.

**Owns:** `sync_devices`, `sync_envelopes`, `sync_conflicts`, `sync_sequences`.

**Depends on:** all modules expose `sync_export()` and `sync_apply()` hooks.

**MVP:** Push/pull for activity progress, indicator values, evidence uploads, master-data pull.
**Post-MVP:** Selective sync per district, sync prioritisation, delta compression.

**Key design points:**
- See `01-high-level-architecture.md §4` for the full sync protocol.
- Conflicts surface in a dedicated **Sync Conflicts** screen for M&E officers.

---

## 21. AI & Insights

**Purpose:** model-driven analytics that augment human decision-making.

**Owns:** `ai_models`, `ai_runs`, `ai_predictions`, `ai_feedback`.

**Depends on:** M&E (training data), Reporting (narrative drafts).

**MVP:** None — placeholder service with one anomaly-detection job for indicator outliers.
**Post-MVP:**
- Forecasting (Prophet / ARIMA / lightGBM) for key indicators per district.
- Narrative drafting via a self-hosted LLM (Llama 3 / Mistral on vLLM) or sovereign-region API.
- RAG over the document corpus for "ask the policy library" queries (pgvector + a small reranker).
- Stockout prediction by combining service data + supply data (when supply integration exists).

**Key design points:**
- All AI outputs are **suggestions**, never authoritative.
- Every prediction stores its inputs, model version, and a confidence score — so a 2028 audit can replay a 2026 decision.
- Human-in-the-loop feedback (`accept` / `reject` / `edit`) flows back to fine-tuning datasets.

---

## 22. Search

**Purpose:** unified search across plans, indicators, reports, documents, people.

**Owns:** `search_index` (materialized), full-text triggers on source tables.

**Depends on:** all content modules.

**MVP:** Postgres full-text search across plans, activities, reports, documents (filename + extracted text).
**Post-MVP:** Semantic search with pgvector embeddings; OpenSearch for scale.

---

## 23. Public API & Open Data

**Purpose:** public-facing, read-only API and downloads of non-sensitive data.

**Owns:** `public_datasets`, `api_consumers`, `usage_metrics`.

**Depends on:** Dashboards (curated views), IAM (api key issuance).

**MVP:** Static open-data portal page; CSV exports of national-level indicators.
**Post-MVP:** Versioned public REST API with API keys, OpenAPI docs, usage analytics, alignment with Sierra Leone Open Data policy.

---

## 24. Platform Admin

**Purpose:** the controls that ICT administrators use to run the platform.

**Owns:** `system_settings`, `feature_flags`, `maintenance_windows`, `backup_status_view`.

**Depends on:** all modules.

**MVP:** User management UI, role/permission management, feature flags, system health page.
**Post-MVP:** Tenant-style isolation if the platform is extended to other ministries, blue/green deploy controls.

---

## Module-to-role responsibility matrix (high level)

| Role / Module               | IAM | Org | Strategy | Plan | Budget | M&E | Activity | Report | Docs | Workflow | Dash | GIS | Integ | Sync | AI | Admin |
|-----------------------------|:---:|:---:|:--------:|:----:|:------:|:---:|:--------:|:------:|:----:|:--------:|:----:|:---:|:-----:|:----:|:--:|:-----:|
| Super admin                 | ✎   | ✎   | ✎        | ✎    | ✎      | ✎   | ✎        | ✎      | ✎    | ✎        | ✎    | ✎   | ✎     | ✎    | ✎  | ✎     |
| Ministry executive          | 👁  | 👁  | ✎        | 👁   | 👁     | 👁  | 👁       | ✓      | 👁   | ✓        | 👁   | 👁  | 👁    | —    | 👁 | —     |
| Directorate head            | 👁  | ✎*  | 👁       | ✎*   | ✎*     | 👁  | 👁       | ✓      | ✎    | ✓        | 👁   | 👁  | —     | —    | 👁 | —     |
| Programme manager           | —   | 👁  | 👁       | ✎    | ✎      | ✎   | ✎        | ✎      | ✎    | ✓        | 👁   | 👁  | —     | —    | 👁 | —     |
| M&E officer                 | —   | 👁  | 👁       | 👁   | 👁     | ✎   | ✎        | ✎      | ✎    | ✓        | ✎    | 👁  | 👁    | 👁   | ✎  | —     |
| Finance officer             | —   | 👁  | —        | 👁   | ✎      | —   | —        | ✎      | ✎    | ✓        | 👁   | —   | 👁    | —    | —  | —     |
| District user               | —   | 👁* | 👁       | 👁*  | 👁*    | ✎*  | ✎*       | ✎*     | ✎*   | ✓        | 👁*  | 👁* | —     | ✎    | 👁 | —     |
| Facility user (mobile)      | —   | 👁* | —        | 👁*  | —      | ✎*  | ✎*       | ✎*     | ✎*   | —        | —    | —   | —     | ✎    | —  | —     |
| Donor viewer                | —   | 👁* | 👁*      | 👁*  | 👁*    | 👁* | 👁*      | 👁*    | 👁*  | —        | 👁*  | 👁* | —     | —    | —  | —     |
| Auditor                     | 👁  | 👁  | 👁       | 👁   | 👁     | 👁  | 👁       | 👁     | 👁   | 👁       | 👁   | 👁  | 👁    | 👁   | 👁 | 👁    |

Legend: ✎ create/edit · ✓ approve · 👁 read · — none · `*` = scoped to user's org / district / programme / funded items.

---

**Next:** [03 — Database schema](03-database-schema.md)
