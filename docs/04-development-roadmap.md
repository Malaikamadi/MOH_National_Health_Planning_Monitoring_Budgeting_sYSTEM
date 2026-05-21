# 04 — Development Roadmap

This roadmap turns the architecture into a sequenced, fundable delivery plan.
It is organised as **seven phases over 24 months**, with concrete deliverables,
team composition, dependencies, and a live risk register.

The over-arching philosophy:
- **Earn trust early.** Phase 1 ships a usable product for two directorates in
  four months. Nothing builds Ministry confidence faster than seeing their own
  AWP appear in a dashboard.
- **Walking-skeleton before features.** Every phase includes deploys, CI/CD,
  observability, and security from day one. We do not add operational maturity
  retroactively.
- **Vertical slices, not horizontal layers.** Each sprint delivers a thin
  end-to-end slice (DB → API → web → mobile if relevant) rather than building
  the whole backend then the whole frontend.

---

## Phase summary

| Phase | Duration | Headline outcome |
|-------|----------|------------------|
| 0. Discovery & Foundation | 6 weeks | Validated requirements, signed architecture, dev/stage envs live |
| 1. MVP — Strategy & AWP | 4 months | 2 directorates plan and approve FY work in NHPMBR |
| 2. Operational Core | 3 months | Budgets, indicators, reporting, full workflow across 10 directorates |
| 3. Field & Mobile | 3 months | District + facility offline mobile reporting in 5 pilot districts |
| 4. Intelligence | 3 months | National dashboards, GIS, donor portal, first AI insight |
| 5. Integration | 3 months | DHIS2, IFMIS, HRIS adapters live, FHIR gateway online |
| 6. Scale, Harden, Handover | 3 months | National rollout, capacity transfer, sustainability plan |

**Total:** ~25 months end-to-end, with the **MVP go-live at month 5.5** and
**national rollout complete by month 25**.

---

## Phase 0 — Discovery & Foundation (Weeks 1–6)

### Goal

Lock the scope, validate assumptions with real users, and stand up the
engineering machine so Phase 1 can run at full speed.

### Workstreams

**Product / Business analysis**
- Stakeholder interviews: DPPI, all directorate heads, M&E, Finance, ICT, 3 districts, 2 donors.
- Catalogue every Excel template currently in use; capture data dictionaries.
- Validate the module list (`docs/02-system-modules.md`) and AWP state machine with DPPI.
- Confirm legal / data-protection requirements (Sierra Leone data protection bill, donor-specific clauses).

**Architecture / Engineering**
- Set up the monorepo and the `services/api`, `apps/web`, `apps/mobile` skeletons.
- Stand up dev and stage environments (Terraform → AWS af-south-1 or equivalent).
- Wire CI/CD: GitHub Actions running lint, type-check, unit tests, container build, Trivy scan, Alembic check.
- Deploy a `healthz` walking skeleton (one endpoint, one page, one mobile screen) all the way to staging on day 10.
- Set up observability stack (Prometheus, Grafana, Loki, Sentry) before any business code.
- Write ADRs 0001–0012 (`docs/adr/`).

**Design**
- Design system in Figma: tokens, typography, components, dark/light, Krio strings.
- Low-fi wireframes for the MVP screens (AWP create, AWP approve, dashboard).

### Deliverables / Definition of done
- Signed-off architecture document.
- Functional CI/CD with green pipeline.
- Staging environment reachable behind authentication.
- Design system v0.1 published in Figma.
- Backlog populated for Phase 1 with story points.

### Team (6 weeks)
- 1 product lead, 1 engineering lead, 1 UX lead, 2 senior engineers,
  1 DevOps, 1 M&E specialist from the Ministry seconded full-time.

---

## Phase 1 — MVP: Strategy & AWP (Months 2–5)

### Goal

Two pilot directorates (recommend **DPPI** and one programme-heavy one like
**DPHA**) author, submit, and approve their FY work plans inside NHPMBR,
end-to-end, replacing the Excel template entirely.

### Modules delivered (MVP shape — see `docs/05-mvp-scope.md` for the line)

- IAM (roles, scopes, MFA optional)
- Organisational Structure (Ministry → Directorate → Programme; districts seeded but not yet active)
- Master Data (fiscal years, currencies, basic indicator dictionary)
- Strategy (one strategic plan with pillars and objectives entered)
- Annual Work Planning (full flow: draft → submit → review → approve)
- Documents (upload, attach to plan, basic preview)
- Workflow (linear approval chain)
- Notifications (email + in-app)
- Audit (mutations on planning entities)
- Platform Admin (user management, system health)
- Dashboards (a single Director dashboard showing AWP status across directorates)

### Engineering plan

**Sprint 1–2 (weeks 1–4):** IAM, Org, Master Data, scaffolding.
**Sprint 3–4:** Strategy module + AWP draft creation.
**Sprint 5–6:** Workflow engine + approval flow + notifications.
**Sprint 7:** Documents, audit log, hardening.
**Sprint 8 (week 16):** UAT with pilot directorates; bug-fix; go-live.

### Quality bar before go-live
- All MVP user journeys covered by Playwright E2E tests, running in CI on every PR.
- Backend coverage ≥ 75%, frontend ≥ 60%.
- p95 latency budgets met on staging with seeded data.
- Penetration test by an independent firm — no critical or high findings unresolved.
- Backup + restore exercise executed and timed.

### Team
- 1 product lead, 1 engineering lead, 4 backend engineers, 3 frontend engineers,
  1 DevOps, 1 QA, 1 UX, 1 M&E specialist, 1 trainer/change manager.

### Pilot rollout
- Train pilot users in week 14.
- Parallel run: pilot directorates submit FY AWP in both Excel *and* NHPMBR for one cycle to validate equivalence.
- Cut over once equivalence is signed off by DPPI.

---

## Phase 2 — Operational Core (Months 6–8)

### Goal

The platform handles the **full annual cycle for all directorates**: plan,
budget, indicators, reports, with multi-stage approvals and proper audit.

### Modules expanded
- Budget & Financial Tracking (allocations, expenditures — manual; no IFMIS yet)
- Donor & Funding (donor agreements, tranches, donor-scoped read-only views)
- M&E / Indicators (targets, manual value entry, disaggregation)
- Activity & Output Tracking (HQ-driven; mobile in Phase 3)
- Milestones (with traffic-light status)
- Reporting (directorate quarterly report — auto-filled tables + narrative)
- Search (Postgres FTS across plans, activities, reports, documents)

### Cross-cutting work
- Roll out RBAC to all 10–14 directorates; complete user onboarding.
- Performance work as data volumes grow (indexes, materialised views, query plan reviews).
- First DR drill.

### Team grows
- +2 backend, +1 frontend, +1 data engineer (for indicator pipelines), +1 trainer.

---

## Phase 3 — Field & Mobile (Months 9–11)

### Goal

District M&E officers and facility officers in **5 pilot districts** report
progress, indicator values, and evidence from the field, **offline-first**.

### Deliverables
- React Native + Expo app, Android-first (iOS optional).
- Offline SQLite/WatermelonDB store, sync protocol implementation, conflict UI.
- Mobile-optimised forms for: activity progress, indicator values, output achievements, evidence uploads, field visit logs.
- District edge node reference design + 2 deployed at pilot districts (Bombali, Bo).
- Sync conflict resolution screens (web) for M&E officers.
- Data quality service v1 (completeness + outlier flags on submissions).

### Devices
- Procurement plan for 7"-10" ruggedised Android tablets for facility in-charges in pilot districts.
- Mobile data SIM plan with negotiated MoH rates.

### Team
- +2 mobile engineers, +1 backend engineer (sync server), +1 field trainer.

### Pilot rollout
- 1-week training in each pilot district before go-live.
- 4-week parallel run with paper forms; cut over only when sync success rate ≥ 99% and user-acceptance scores ≥ 4/5.

---

## Phase 4 — Intelligence (Months 12–14)

### Goal

Decision-makers get **answers, not just data**: rich dashboards, GIS,
donor visibility, and the first wave of AI-powered insights.

### Deliverables
- Executive, Directorate, Programme, District, Donor dashboards (purpose-built; not a self-service builder yet).
- GIS module: facility map, district choropleths, indicator overlays.
- Donor portal (scoped read-only view of funded activities, budgets, indicators).
- Search v2: pgvector embeddings on documents for semantic search.
- AI/Insights module v1:
  - Anomaly detection on indicator submissions (z-score + seasonal decomposition).
  - Narrative drafting on quarterly reports — self-hosted Llama 3 / Mistral via vLLM on a GPU box (sovereign-hosted).
- Public open-data page: a curated set of national-level indicators as CSV downloads.

### Team
- +1 data engineer, +1 ML engineer, +1 GIS specialist (contract).

---

## Phase 5 — Integration (Months 15–17)

### Goal

NHPMBR stops being an island. Data flows in and out of the country's other
health and government systems.

### Deliverables
- **DHIS2 integration:** scheduled pull of agreed indicators with mapping and provenance.
- **IFMIS integration:** scheduled pull of expenditure transactions; matching to budget lines; reconciliation reports.
- **HRIS / IHRIS integration:** staff postings synced to Org module.
- **FHIR R4 gateway:** HAPI FHIR fronted with our auth, exposing Patient/Encounter/Observation if/when clinical-system integration becomes a priority.
- **KOBO / ODK** adapter for survey data into M&E.
- **Integration Hub UI** for ICT admins (sync status, mappings, manual retry).

### Team
- +2 integration engineers (with DHIS2 / FHIR experience), +1 BA for IFMIS chart-of-accounts mapping.

---

## Phase 6 — Scale, Harden, Handover (Months 18–24+)

### Goal

National rollout complete. Ministry can operate, evolve, and govern the
platform without external dependency.

### Deliverables
- Rollout to all 16 districts and ~1,300 facilities (phased).
- Capacity transfer: MoH ICT team trained to operate the platform; we transition to advisory.
- Sustainability plan: budgeted line item in MoH ICT annual budget; vendor contracts for cloud + connectivity.
- Hardening: chaos engineering exercises, full DR rehearsal, third-party security re-audit.
- Public API + open data v1 launched.
- Documentation, runbooks, training videos, "train the trainer" cohorts.

### Exit criteria
- ≥ 90% of districts submitting quarterly reports in NHPMBR with ≥ 90% data-quality scores.
- All 14 directorates submit AWPs in NHPMBR for the next fiscal year.
- 4 of the top 5 donors consuming their dashboards weekly.
- MoH ICT team operating the platform with a < 2-week external escalation rate.

---

## Team shape (peak, mid-Phase 4)

| Function | Headcount | Notes |
|----------|-----------|-------|
| Product lead | 1 | |
| Engineering lead | 1 | |
| Backend engineers | 6 | Python/FastAPI, SQL, async, integrations |
| Frontend engineers | 4 | Next.js, React, Tailwind, accessibility |
| Mobile engineers | 2 | React Native, offline sync |
| Data / ML engineers | 2 | dbt-style pipelines, pgvector, anomaly detection |
| GIS specialist | 1 (contract) | PostGIS, maps, accessibility analysis |
| DevOps / SRE | 2 | Terraform, K8s, observability, on-call |
| QA | 2 | Manual + Playwright |
| UX designer | 1 | Plus Figma library curator |
| Trainer / change manager | 2 | Field-based, district rollouts |
| Ministry counterparts | 4–6 | Seconded full-time across DPPI, ICT, M&E, Finance |

Total ~26–30 at peak, ramping from ~9 in Phase 0.

---

## Risk register (top items)

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| 1 | Connectivity at districts/facilities is worse than planned | High | High | District edge nodes, SMS fallback for critical reports, generous offline buffer |
| 2 | Electricity outages affecting both central and edge infra | High | High | UPS + generator at MoH data centre; solar + battery at district edges; AWS multi-AZ for cloud workloads |
| 3 | Government data-sovereignty rules force on-prem deployment | Medium | High | Architecture is hyperscaler-portable; K8s + MinIO works fully on-prem |
| 4 | DHIS2 metadata mismatches with our indicator dictionary | High | Medium | Explicit mapping table + per-indicator provenance + audit |
| 5 | Directorate resistance ("the Excel template still works") | High | High | Pilot directorates first; visible wins; ministerial sponsorship; never force a removal until equivalence is proven |
| 6 | Donor reporting requirements diverge from national format | Medium | Medium | Template DSL allows donor-specific templates without code changes |
| 7 | Key engineers leaving mid-build | Medium | High | Pair programming, ADRs, runbooks; favour boring tech over novelty |
| 8 | Security incident (credential leak, data exfiltration) | Low | Catastrophic | RBAC + RLS + audit chain + Vault + quarterly pen tests + tabletop exercises |
| 9 | LLM hallucination in AI-drafted narratives | Medium | Medium | Human-in-the-loop required; explainability metadata; never auto-publish |
| 10 | Budget cuts mid-programme | Medium | High | Modular delivery — every phase is independently usable; we can pause after Phase 2 with a working operational system |
| 11 | Mobile app rejected by Google Play | Low | Medium | EAS internal distribution as fallback; signed APK direct-install with MDM |
| 12 | IFMIS API access denied / unstable | Medium | High | CSV ingestion as fallback; design Integration Hub to swap adapters without app changes |
| 13 | Data quality is worse than expected, undermining dashboards | High | Medium | Data quality score visible per submission; "verified" vs "raw" indicator views; outlier flagging |

---

## Engineering practices (non-negotiable from day one)

- **Trunk-based development** with short-lived feature branches and PR reviews.
- **Conventional commits** + automated changelog.
- **All migrations via Alembic**; never raw SQL on prod.
- **Feature flags** (Unleash or homegrown table) for risky changes.
- **OpenAPI is generated** and committed; web/mobile clients auto-generated from it.
- **No secrets in env files committed to git**; pre-commit hook + secret scanner in CI.
- **Every PR runs:** unit, integration, contract tests, lint, type check, container build, security scan, Alembic up/down dry run.
- **Daily backup + monthly restore drill** from day 1 in staging.
- **On-call rotation** from MVP go-live, even with a 4-person team.
- **ADRs are mandatory** for every significant decision; PR descriptions reference the relevant ADR.

---

## Budgeting note (order-of-magnitude only)

Building a national-grade platform of this scope responsibly costs in the
range of **USD 2.0–3.5M over 24 months** including:

- Engineering team (the largest line item by far, 60–70% of total)
- Infrastructure (cloud + connectivity + edge nodes + tablets)
- Independent security audits and penetration tests
- Training, change management, district rollouts
- Contingency (15%)

Phased so that each phase can be funded independently — the platform is
usable and valuable after Phase 1, and again after each subsequent phase.

---

**Next:** [05 — MVP scope](05-mvp-scope.md)
