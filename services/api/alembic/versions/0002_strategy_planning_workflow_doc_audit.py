"""strategy, planning, workflow, doc and audit tables.

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-18
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ---------- strategy ----------
    op.create_table(
        "plans",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("starts_on", sa.Date(), nullable=False),
        sa.Column("ends_on", sa.Date(), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column(
            "approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("iam.users.id")
        ),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column("vision", sa.Text()),
        sa.Column("mission", sa.Text()),
        sa.Column("document_id", postgresql.UUID(as_uuid=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.CheckConstraint(
            "status IN ('draft','approved','published','superseded','archived')",
            name="ck_plans__status_valid",
        ),
        sa.UniqueConstraint("code", name="uq_plans__code"),
        schema="strategy",
    )

    op.create_table(
        "pillars",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "plan_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("strategy.plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("code", sa.String(16), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.UniqueConstraint("plan_id", "code", name="uq_pillars__plan_code"),
        schema="strategy",
    )

    op.create_table(
        "objectives",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "pillar_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("strategy.pillars.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(512), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column(
            "owner_directorate_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.directorates.id"),
        ),
        sa.Column(
            "outcome_indicator_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mdm.indicator_definitions.id"),
        ),
        sa.UniqueConstraint("pillar_id", "code", name="uq_objectives__pillar_code"),
        schema="strategy",
    )

    # ---------- planning ----------
    op.create_table(
        "annual_work_plans",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "fiscal_year_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("mdm.fiscal_years.id"),
            nullable=False,
        ),
        sa.Column(
            "directorate_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.directorates.id"),
            nullable=False,
        ),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True)),
        sa.Column("approved_at", sa.DateTime(timezone=True)),
        sa.Column(
            "approved_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("iam.users.id")
        ),
        sa.Column("total_budget", sa.Numeric(18, 2)),
        sa.Column(
            "currency_code",
            sa.String(3),
            sa.ForeignKey("mdm.currencies.code"),
            nullable=False,
            server_default="SLE",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.CheckConstraint(
            "status IN ('draft','submitted','under_review','revisions_requested',"
            "'approved','active','closed')",
            name="ck_awp__status_valid",
        ),
        sa.UniqueConstraint(
            "fiscal_year_id", "directorate_id", name="uq_awp__fy_directorate"
        ),
        schema="planning",
    )

    op.create_table(
        "awp_activities",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "awp_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("planning.annual_work_plans.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "objective_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("strategy.objectives.id"),
            nullable=False,
        ),
        sa.Column(
            "programme_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.programmes.id"),
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("owner_org_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("executor_org_id", postgresql.UUID(as_uuid=True)),
        sa.Column("executor_org_type", sa.String(32)),
        sa.Column("starts_on", sa.Date(), nullable=False),
        sa.Column("ends_on", sa.Date(), nullable=False),
        sa.Column("expected_output", sa.Text()),
        sa.Column("status", sa.String(32), nullable=False, server_default="planned"),
        sa.Column("progress_pct", sa.SmallInteger()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.CheckConstraint("ends_on >= starts_on", name="ck_awp_activity__period_valid"),
        sa.CheckConstraint(
            "progress_pct IS NULL OR (progress_pct BETWEEN 0 AND 100)",
            name="ck_awp_activity__progress_valid",
        ),
        sa.CheckConstraint(
            "status IN ('planned','in_progress','delayed','completed','cancelled')",
            name="ck_awp_activity__status_valid",
        ),
        sa.UniqueConstraint("awp_id", "code", name="uq_awp_activities__awp_code"),
        schema="planning",
    )
    op.create_index(
        "ix_awp_activities_awp", "awp_activities", ["awp_id"], schema="planning"
    )
    op.create_index(
        "ix_awp_activities_objective", "awp_activities", ["objective_id"], schema="planning"
    )
    op.create_index(
        "ix_awp_activities_executor",
        "awp_activities",
        ["executor_org_id", "executor_org_type"],
        schema="planning",
    )
    op.create_index(
        "ix_awp_activities_period",
        "awp_activities",
        ["starts_on", "ends_on"],
        schema="planning",
    )

    # ---------- workflow ----------
    op.create_table(
        "definitions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("spec", postgresql.JSONB(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.UniqueConstraint("code", "version", name="uq_workflow_def__code_version"),
        schema="workflow",
    )

    op.create_table(
        "instances",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "definition_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workflow.definitions.id"),
            nullable=False,
        ),
        sa.Column("target_type", sa.String(64), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("current_state", sa.String(64), nullable=False),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column(
            "initiated_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "target_type", "target_id", name="uq_workflow_instances__target"
        ),
        schema="workflow",
    )

    op.create_table(
        "tasks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "instance_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("workflow.instances.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "assignee_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
        ),
        sa.Column(
            "assignee_role_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.roles.id"),
        ),
        sa.Column("state", sa.String(32), nullable=False, server_default="pending"),
        sa.Column("due_at", sa.DateTime(timezone=True)),
        sa.Column(
            "completed_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("outcome", sa.String(32)),
        sa.Column("comment", sa.Text()),
        sa.CheckConstraint(
            "state IN ('pending','in_progress','completed','skipped','rejected','reassigned')",
            name="ck_workflow_tasks__state_valid",
        ),
        schema="workflow",
    )
    op.create_index(
        "ix_workflow_tasks_assignee",
        "tasks",
        ["assignee_user_id", "state"],
        schema="workflow",
    )

    # ---------- doc ----------
    op.create_table(
        "documents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("name", sa.String(512), nullable=False),
        sa.Column("mime_type", sa.String(128), nullable=False),
        sa.Column("size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("content_sha256", sa.String(64), nullable=False),
        sa.Column("storage_key", sa.String(512), nullable=False),
        sa.Column("storage_bucket", sa.String(128), nullable=False),
        sa.Column(
            "uploaded_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
            nullable=False,
        ),
        sa.Column(
            "uploaded_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("virus_scanned_at", sa.DateTime(timezone=True)),
        sa.Column("virus_scan_result", sa.String(32)),
        sa.Column("linked_entity", sa.String(64), nullable=False),
        sa.Column("linked_entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String())),
        sa.Column(
            "sensitivity", sa.String(32), nullable=False, server_default="internal"
        ),
        sa.CheckConstraint(
            "sensitivity IN ('public','internal','restricted','confidential')",
            name="ck_documents__sensitivity_valid",
        ),
        schema="doc",
    )
    op.create_index(
        "ix_documents_linked",
        "documents",
        ["linked_entity", "linked_entity_id"],
        schema="doc",
    )
    op.create_index(
        "ix_documents_hash", "documents", ["content_sha256"], schema="doc"
    )
    op.execute(
        "CREATE INDEX ix_documents_tags ON doc.documents USING GIN (tags)"
    )

    # ---------- audit ----------
    op.create_table(
        "event_log",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("sequence_no", sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column(
            "occurred_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "actor_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
        ),
        sa.Column("actor_role", sa.String(64)),
        sa.Column("actor_ip", postgresql.INET()),
        sa.Column("actor_device_id", postgresql.UUID(as_uuid=True)),
        sa.Column("action", sa.String(32), nullable=False),
        sa.Column("entity_schema", sa.String(64), nullable=False),
        sa.Column("entity_table", sa.String(64), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True)),
        sa.Column("before_state", postgresql.JSONB()),
        sa.Column("after_state", postgresql.JSONB()),
        sa.Column("request_id", postgresql.UUID(as_uuid=True)),
        sa.Column("prev_hash", sa.String(64)),
        sa.Column("row_hash", sa.String(64), nullable=False),
        schema="audit",
    )
    op.create_index(
        "ix_audit_entity",
        "event_log",
        ["entity_schema", "entity_table", "entity_id"],
        schema="audit",
    )
    op.create_index(
        "ix_audit_actor",
        "event_log",
        ["actor_user_id", "occurred_at"],
        schema="audit",
    )
    op.execute("REVOKE UPDATE, DELETE ON audit.event_log FROM PUBLIC")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS audit.event_log CASCADE")
    op.execute("DROP TABLE IF EXISTS doc.documents CASCADE")
    op.execute("DROP TABLE IF EXISTS workflow.tasks CASCADE")
    op.execute("DROP TABLE IF EXISTS workflow.instances CASCADE")
    op.execute("DROP TABLE IF EXISTS workflow.definitions CASCADE")
    op.execute("DROP TABLE IF EXISTS planning.awp_activities CASCADE")
    op.execute("DROP TABLE IF EXISTS planning.annual_work_plans CASCADE")
    op.execute("DROP TABLE IF EXISTS strategy.objectives CASCADE")
    op.execute("DROP TABLE IF EXISTS strategy.pillars CASCADE")
    op.execute("DROP TABLE IF EXISTS strategy.plans CASCADE")
