# 05 — MVP Scope

This document is the **contract** for the first release of NHPMBR. It defines
what ships, what does **not** ship, the user stories it satisfies, the
acceptance criteria, the demo script, and the post-MVP backlog.

If a feature is not listed in "In scope" below, it does not belong in the
MVP. Scope creep is the single biggest predictor of public-sector ICT failure.

---

## 1. MVP thesis

**"Two directorates plan, submit, and approve their annual work plans inside
NHPMBR, end-to-end, in one fiscal year cycle, and the Minister can see the
status at a glance."**

That is the entire goal. Everything in scope serves this thesis.

---

## 2. Target users (MVP)

| Persona | Population (MVP) | Channel |
|---------|------------------|---------|
| Ministry executive | ~5 (Minister, Chief Medical Officer, DPPI Director, ICT Director, 1 advisor) | Web |
| Directorate head | 2 (the pilot directorates) | Web |
| Programme manager | ~8 across the 2 directorates | Web |
| M&E officer | 2–3 | Web |
| Finance officer (read-only, MVP) | 2 | Web |
| ICT administrator | 2 | Web |
| **Total MVP users** | **~20–25** | Web only |

Districts, facilities, donors, and mobile come in subsequent phases.

---

## 3. In scope

### 3.1 Identity & access (IAM)

- Email/password login backed by Keycloak.
- Optional TOTP MFA (Google Authenticator).
- Role assignment from a fixed seed set: `super_admin`, `ministry_executive`,
  `directorate_head`, `programme_manager`, `me_officer`, `finance_officer`,
  `ict_admin`, `auditor`.
- Organisational scope assignment (directorate, programme).
- Password reset by email; account lockout after 5 failed attempts.
- Session timeout: 30 min idle, 8 h absolute.

### 3.2 Organisational structure

- Ministry → directorates (all 14 seeded) → programmes (all known seeded).
- Districts, chiefdoms, facilities seeded as **reference data** but not yet
  active in MVP workflows.
- Org chart visualisation on the admin page.

### 3.3 Master data

- Fiscal years (current + previous + next, configurable).
- Currencies (SLE, USD, EUR, GBP with editable FX rates).
- Indicator dictionary — seeded with ~50 core national indicators.

### 3.4 Strategy

- One **Strategic Plan** (the current NHSP) entered:
  - Plan metadata (name, vision, mission, period, signed PDF upload).
  - Pillars (e.g., Pillar 1 — Service Delivery; Pillar 2 — Health Workforce …).
  - Objectives under each pillar, each with an owner directorate and an
    outcome indicator (referenced from the indicator dictionary).
- Read-only browsing of the strategic plan from any logged-in user.

### 3.5 Annual Work Plan (AWP) — the centrepiece

- Create a new AWP for `(fiscal_year, directorate)`.
- Add activities under an AWP, each:
  - Linked to a strategic objective.
  - Optionally linked to a programme.
  - With a code, title, description, period (start/end), expected output.
  - With an owner and executor org.
- Add outputs under each activity (target value + unit + linked indicator).
- Add milestones under each activity (title + due date).
- Save as draft; revisit and edit until submission.
- Submit AWP — triggers the approval workflow.

### 3.6 Workflow & approvals

- One built-in workflow definition: `awp_approval_v1`.
- States: `draft → submitted → under_review → revisions_requested → approved → active → closed`.
- Approval chain:
  1. Programme manager (where applicable) — review activities under their programme.
  2. Directorate head — review and submit.
  3. DPPI reviewer — review against strategic alignment.
  4. DPPI director — final approval.
- At each step the reviewer can **approve**, **request revisions** (with comments),
  or **reassign**.
- SLAs: configurable per step; surfaced in the UI; email reminders at 50% and 100% of SLA.

### 3.7 Documents

- Upload PDFs, Word, Excel, images (PNG/JPG) up to 25 MB each.
- Attach to AWPs and activities (evidence of need, prior-year reports, etc.).
- Virus scan on upload (ClamAV); files quarantined if positive.
- Preview for PDF and image; download for other types.
- Soft delete with audit; permanent deletion only by super admin.

### 3.8 Notifications

- Email notifications via SES (or sovereign-region SMTP) for:
  - AWP submitted to me for review.
  - Revisions requested on my AWP.
  - AWP approved.
  - SLA reminder.
  - User account changes affecting me.
- In-app notification bell with the same events; unread count.

### 3.9 Audit

- Every create / update / delete / approve action on planning, strategy,
  documents, and IAM entities writes a row to `audit.event_log`.
- Hash-chained, immutable.
- "Activity history" panel on every AWP and activity, drawn from the audit log.
- Super admin can browse and filter the full audit log; export CSV.

### 3.10 Dashboards

One dashboard ships in MVP — the **Executive AWP Status dashboard**:

- KPI tiles: AWPs submitted / approved / active for the current FY.
- Table: every directorate, their AWP status, approver, submission date,
  next milestone due, % of activities by status.
- Drill-down link from each row into the AWP detail view.

Each directorate head also gets a **scoped** version of this dashboard
filtered to their directorate.

### 3.11 Platform admin

- User management UI (create, edit, deactivate, role/scope assignment).
- Role and permission viewer (read-only in MVP — permissions managed via seed).
- System health page (DB, Redis, queue depth, last backup, last deploy).
- Feature flag management UI (read/write for super admin).

### 3.12 Cross-cutting

- English UI; Krio translations stubbed for 30% of strings (priority screens).
- Light mode only (dark mode post-MVP).
- WCAG 2.1 AA on all MVP screens.
- Mobile-responsive web (works on a 7" tablet) — but no React Native app yet.

---

## 4. Out of scope (explicitly)

The following are valuable and planned but **do not ship in MVP**:

- **Mobile app (React Native)**. Web-only for MVP.
- **District / facility data entry**. Districts are seeded as reference only.
- **Budget execution, expenditure entry, IFMIS integration**. Finance is
  read-only on AWPs in MVP; budget lines are entered as planning estimates
  only, not tracked against actuals.
- **Donor portal**. Donors are seeded; no donor user accounts in MVP.
- **DHIS2, FHIR, HRIS, IFMIS adapters**.
- **GIS / mapping**.
- **AI / ML features**. (One placeholder anomaly job may run for
  pre-staging instrumentation but its output is not exposed.)
- **Public open-data portal**.
- **Self-service dashboard builder**. Only the curated dashboards above.
- **Self-service report generation**. Reports come in Phase 2.
- **WebAuthn, SSO with external IdPs, SCIM provisioning**.
- **Workflow DSL editor UI** (workflows are still defined in YAML by ICT).
- **Versioned strategic plan editing** (the seeded plan is treated as
  authoritative; revision support comes later).
- **Mid-cycle re-planning** (one AWP per directorate per FY; revisions reset state).

---

## 5. User stories (MVP backlog headlines)

The full backlog has ~140 stories. The headline epics:

1. **As a super admin, I can set up the Ministry hierarchy** so users can be scoped correctly.
2. **As a super admin, I can onboard users with the right roles and scopes** so they only see their data.
3. **As DPPI, I can publish the National Strategic Plan** so everyone plans against the same framework.
4. **As a programme manager, I can author my programme's portion of the directorate AWP** with activities, outputs, milestones, and indicator targets.
5. **As a directorate head, I can review and submit my directorate's AWP** through a clear approval workflow.
6. **As a DPPI reviewer, I can compare each AWP against the strategic plan** and request revisions if alignment is poor.
7. **As DPPI director, I can give final approval** and have the platform mark the AWP active.
8. **As a Ministry executive, I can see at a glance** which directorates have submitted, which are approved, and which are late.
9. **As an M&E officer, I can confirm that every objective has at least one indicator target** before approval.
10. **As an auditor, I can trace every change to a plan** back to a user, time, and prior state.

Each epic decomposes into ~10–15 user stories with acceptance criteria.

---

## 6. Acceptance criteria (release gate)

The MVP is **not** released until **all** of the following hold:

### Functional
- [ ] Both pilot directorates have authored, submitted, reviewed, and
      approved their FY AWP entirely inside NHPMBR.
- [ ] The approval workflow has been exercised end-to-end with at least
      one "revisions requested" cycle.
- [ ] The Executive AWP Status dashboard reflects reality (manually
      verified against the source-of-truth AWPs).
- [ ] Every audited event for those AWPs appears in the audit log with
      correct actor, timestamp, before/after, and hash linkage.

### Non-functional
- [ ] p95 latency budgets met against staging with realistic data volume
      (50 AWPs, 2,000 activities, 10,000 audit rows).
- [ ] Zero critical/high findings outstanding from independent pen test.
- [ ] Backup + restore drill executed end-to-end, with documented timings.
- [ ] DR runbook exists, reviewed by ICT, and tested at least once.
- [ ] OpenAPI spec is complete, versioned, and serves as the source for
      the auto-generated TypeScript clients used by the web app.

### Operational
- [ ] On-call rotation defined with at least 2 engineers + ICT counterpart.
- [ ] Runbooks exist for: user lockout, failed login surge, DB failover,
      lost backup verification, certificate rotation.
- [ ] Monitoring dashboards (Grafana) show RED metrics per endpoint,
      DB health, queue depth, and authentication failure rates.
- [ ] All deploys are reproducible via Terraform + ArgoCD from a clean
      AWS account in < 4 hours.

### Training & change management
- [ ] All MVP users trained (live workshop + 5-minute video per role).
- [ ] User guide published (1-pager per role + searchable knowledge base).
- [ ] Helpdesk channel established (Teams or similar) with SLA expectations.
- [ ] Parallel-run period with Excel completed and signed off by both
      pilot directorate heads.

---

## 7. Demo script (for ministerial sign-off)

A **30-minute** demo that proves the MVP. Roles are played live by the
trained users from the pilot directorates.

1. **(2 min) Welcome & context.** Why NHPMBR, what we're showing today.
2. **(3 min) Login as a programme manager.** MFA flow shown. Land on the
   programme manager home; show scoped AWP list.
3. **(5 min) Draft an activity.** Create a new activity under the
   directorate AWP: link to objective, add outputs, milestones, indicator
   target, attach an evidence PDF. Save draft.
4. **(3 min) Submit for review.** Submit the AWP; show the workflow state
   transition and the email notification arriving for the directorate head.
5. **(4 min) Switch to directorate head.** Receive notification, open the
   AWP, request revisions on one activity with a comment. Show the audit
   log update.
6. **(3 min) Programme manager fixes and resubmits.** Show the comment
   thread and resubmission.
7. **(3 min) DPPI reviewer approves.** Switch to DPPI reviewer, approve
   the AWP, hand off to DPPI director.
8. **(3 min) DPPI director gives final approval.** AWP becomes active.
9. **(3 min) Ministry executive dashboard.** Switch to the Minister's
   view. See the AWP appear as approved. Drill into the directorate.
10. **(1 min) Audit trail.** Show the full lineage of changes from draft
    to approved, with timestamps, users, and the hash chain intact.

---

## 8. Post-MVP backlog (the next 90 days)

Ordered by value × feasibility, fed into Phase 2 planning:

1. Rollout to remaining 12 directorates (mostly user training + data load).
2. Budget execution (expenditure entry against budget lines).
3. Manual indicator value entry for active AWPs.
4. Directorate quarterly report (auto-filled template + narrative).
5. Donor read-only view (donor accounts, donor dashboard).
6. Full Krio translation.
7. Mid-year re-planning workflow (controlled revisions to an active AWP).
8. Programme-level dashboard.
9. Workflow DSL editor UI for super admin.
10. Search across plans and documents (Postgres FTS UI).

---

## 9. Initial demo-data plan

A reproducible seed script populates staging and demo environments with:

- 14 directorates with realistic codes and names.
- ~40 programmes mapped to directorates.
- 1 strategic plan with 5 pillars and 25 objectives.
- 16 districts, ~150 chiefdoms, ~1,300 facilities with real geocoordinates from MFL.
- 50 core indicators in the dictionary with baselines.
- 2 fully-authored AWPs for the pilot directorates (~80 activities each).
- 25 demo users across the roles, each with realistic scopes.
- A handful of evidence documents in the document store.

The seed is in `data/seed/` and runs in <60 seconds.

---

## 10. Definition of "MVP done"

MVP is done when **the Minister logs in, sees the dashboard, opens an
approved AWP, and the directorate head and DPPI director are both
willing to stake their reputation on it being the source of truth.**

That is the only definition that matters.

---

**End of MVP scope.** For sequencing, see `04-development-roadmap.md`.
For architecture, see `01-high-level-architecture.md`.
