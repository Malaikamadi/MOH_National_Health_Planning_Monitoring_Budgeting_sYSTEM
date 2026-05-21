"""initial schemas, extensions and foundation tables (IAM, Org, MDM).

Revision ID: 0001
Revises:
Create Date: 2026-05-18

This is the *bootstrap* migration. It:
  1. Creates the per-module PostgreSQL schemas.
  2. Ensures required extensions are present (the postgres init.sql does this
     in Docker, but we repeat here so the migration is self-sufficient when
     applied against managed RDS).
  3. Creates the foundation tables (iam.*, org.*, mdm.*) on which every
     other module depends.

Subsequent migrations add the strategy / planning / workflow / doc / audit
tables and any RLS policies.
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SCHEMAS = ["iam", "org", "mdm", "strategy", "planning", "workflow", "doc", "audit", "sync"]


def upgrade() -> None:
    # ---------- Schemas ----------
    for s in SCHEMAS:
        op.execute(f'CREATE SCHEMA IF NOT EXISTS "{s}"')

    # ---------- Extensions ----------
    for ext in (
        "uuid-ossp",
        "pgcrypto",
        "citext",
        "pg_trgm",
        "btree_gin",
        "postgis",
    ):
        op.execute(f'CREATE EXTENSION IF NOT EXISTS "{ext}"')

    # ---------- UUIDv7 helper ----------
    # Postgres 17 will ship a native uuidv7(); for 16 we provide a portable
    # plpgsql implementation. Sortable, RFC 9562 compliant (version=7, RFC 4122 variant).
    op.execute(
        r"""
        CREATE OR REPLACE FUNCTION public.uuid_generate_v7()
        RETURNS uuid
        LANGUAGE plpgsql
        AS $$
        DECLARE
            unix_ts_ms bytea;
            uuid_bytes bytea;
        BEGIN
            -- 48-bit big-endian timestamp in milliseconds
            unix_ts_ms := substring(int8send(
                (extract(epoch from clock_timestamp()) * 1000)::bigint
            ) FROM 3);

            -- 10 random bytes
            uuid_bytes := unix_ts_ms || gen_random_bytes(10);

            -- Set version (7) on the high nibble of byte 6
            uuid_bytes := set_byte(uuid_bytes, 6,
                (get_byte(uuid_bytes, 6) & 15) | 112);
            -- Set RFC 4122 variant (10xx) on the high bits of byte 8
            uuid_bytes := set_byte(uuid_bytes, 8,
                (get_byte(uuid_bytes, 8) & 63) | 128);

            RETURN encode(uuid_bytes, 'hex')::uuid;
        END;
        $$;
        """
    )

    # ---------- IAM ----------
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("keycloak_sub", sa.String(), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone_e164", sa.String(20)),
        sa.Column("preferred_lang", sa.String(2), nullable=False, server_default="en"),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column("last_login_at", sa.DateTime(timezone=True)),
        sa.Column(
            "mfa_enrolled", sa.Boolean(), nullable=False, server_default=sa.text("false")
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("keycloak_sub", name="uq_users__keycloak_sub"),
        sa.UniqueConstraint("email", name="uq_users__email"),
        schema="iam",
    )

    op.create_table(
        "roles",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.String(512)),
        sa.Column("is_system", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.UniqueConstraint("code", name="uq_roles__code"),
        schema="iam",
    )

    op.create_table(
        "permissions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(128), nullable=False),
        sa.Column("domain", sa.String(64), nullable=False),
        sa.Column("entity", sa.String(64), nullable=False),
        sa.Column("action", sa.String(32), nullable=False),
        sa.UniqueConstraint("code", name="uq_permissions__code"),
        schema="iam",
    )

    op.create_table(
        "role_permissions",
        sa.Column(
            "role_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.roles.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "permission_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.permissions.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        schema="iam",
    )

    op.create_table(
        "user_roles",
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "role_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.roles.id"),
            primary_key=True,
        ),
        sa.Column(
            "granted_by",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
            nullable=False,
        ),
        sa.Column(
            "granted_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        schema="iam",
    )

    op.create_table(
        "user_scopes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("scope_type", sa.String(32), nullable=False),
        sa.Column("scope_ref_id", postgresql.UUID(as_uuid=True)),
        sa.CheckConstraint(
            "scope_type IN ('global','directorate','programme','district','facility','funding_source')",
            name="ck_user_scopes__type_valid",
        ),
        sa.UniqueConstraint(
            "user_id", "scope_type", "scope_ref_id", name="uq_user_scopes__user_type_ref"
        ),
        schema="iam",
    )
    op.create_index(
        "ix_user_scopes_lookup", "user_scopes", ["user_id", "scope_type"], schema="iam"
    )

    # ---------- Org ----------
    op.create_table(
        "directorates",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "parent_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.directorates.id"),
        ),
        sa.Column(
            "head_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("iam.users.id")
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("valid_from", sa.Date(), nullable=False),
        sa.Column("valid_to", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("code", name="uq_directorates__code"),
        schema="org",
    )

    op.create_table(
        "programmes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "directorate_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.directorates.id"),
            nullable=False,
        ),
        sa.Column(
            "manager_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("iam.users.id")
        ),
        sa.Column("description", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.UniqueConstraint("code", name="uq_programmes__code"),
        schema="org",
    )

    op.create_table(
        "districts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(16), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column("region", sa.String(64), nullable=False),
        sa.Column("population", sa.Integer()),
        sa.Column("valid_from", sa.Date(), nullable=False),
        sa.Column("valid_to", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("code", name="uq_districts__code"),
        schema="org",
    )
    op.execute("ALTER TABLE org.districts ADD COLUMN geometry geometry(MultiPolygon, 4326)")
    op.execute("CREATE INDEX ix_districts_geom ON org.districts USING GIST (geometry)")

    op.create_table(
        "chiefdoms",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(128), nullable=False),
        sa.Column(
            "district_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.districts.id"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("code", name="uq_chiefdoms__code"),
        schema="org",
    )
    op.execute("ALTER TABLE org.chiefdoms ADD COLUMN geometry geometry(MultiPolygon, 4326)")

    op.create_table(
        "facilities",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(32), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("facility_type", sa.String(64), nullable=False),
        sa.Column("ownership", sa.String(32), nullable=False),
        sa.Column(
            "chiefdom_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("org.chiefdoms.id")
        ),
        sa.Column(
            "district_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("org.districts.id"),
            nullable=False,
        ),
        sa.Column(
            "in_charge_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("iam.users.id"),
        ),
        sa.Column(
            "is_operational", sa.Boolean(), nullable=False, server_default=sa.text("true")
        ),
        sa.Column("dhis2_uid", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.UniqueConstraint("code", name="uq_facilities__code"),
        schema="org",
    )
    op.execute("ALTER TABLE org.facilities ADD COLUMN location geometry(Point, 4326)")
    op.execute(
        "ALTER TABLE org.facilities ADD COLUMN catchment geometry(MultiPolygon, 4326)"
    )
    op.create_index("ix_facilities_district", "facilities", ["district_id"], schema="org")
    op.execute(
        "CREATE INDEX ix_facilities_location ON org.facilities USING GIST (location)"
    )
    op.execute(
        "CREATE INDEX ix_facilities_name_trgm ON org.facilities USING GIN (name gin_trgm_ops)"
    )

    # ---------- MDM ----------
    op.create_table(
        "fiscal_years",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(16), nullable=False),
        sa.Column("starts_on", sa.Date(), nullable=False),
        sa.Column("ends_on", sa.Date(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.CheckConstraint("ends_on > starts_on", name="ck_fiscal_years__dates_valid"),
        sa.UniqueConstraint("code", name="uq_fiscal_years__code"),
        schema="mdm",
    )

    op.create_table(
        "currencies",
        sa.Column("code", sa.String(3), primary_key=True),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("minor_unit", sa.SmallInteger(), nullable=False, server_default="2"),
        schema="mdm",
    )

    op.create_table(
        "indicator_definitions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("uuid_generate_v7()"),
        ),
        sa.Column("code", sa.String(64), nullable=False),
        sa.Column("name_en", sa.String(255), nullable=False),
        sa.Column("name_kri", sa.String(255)),
        sa.Column("description", sa.Text()),
        sa.Column("data_type", sa.String(32), nullable=False),
        sa.Column("unit", sa.String(32)),
        sa.Column("direction", sa.String(32), nullable=False),
        sa.Column("default_disaggregation", postgresql.ARRAY(sa.String())),
        sa.Column("fhir_code", sa.String(128)),
        sa.Column("dhis2_uid", sa.String(64)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
        sa.CheckConstraint(
            "data_type IN ('integer','decimal','percentage','rate','count','ratio','text','boolean')",
            name="ck_indicator_definitions__data_type",
        ),
        sa.CheckConstraint(
            "direction IN ('higher_better','lower_better','target_based')",
            name="ck_indicator_definitions__direction",
        ),
        sa.UniqueConstraint("code", name="uq_indicator_definitions__code"),
        schema="mdm",
    )

    # ---------- Seed: core permissions, roles, currencies, fiscal years ----------
    _seed_baseline()


def _seed_baseline() -> None:
    """Insert the bare-minimum reference data so the API can boot."""
    permissions = [
        ("iam.users.read", "iam", "users", "read"),
        ("iam.users.create", "iam", "users", "create"),
        ("iam.users.update", "iam", "users", "update"),
        ("iam.users.deactivate", "iam", "users", "deactivate"),
        ("iam.roles.assign", "iam", "roles", "assign"),
        ("iam.scopes.assign", "iam", "scopes", "assign"),
        ("org.directorate.read", "org", "directorate", "read"),
        ("org.directorate.create", "org", "directorate", "create"),
        ("org.directorate.update", "org", "directorate", "update"),
        ("org.programme.read", "org", "programme", "read"),
        ("org.programme.create", "org", "programme", "create"),
        ("org.district.read", "org", "district", "read"),
        ("org.facility.read", "org", "facility", "read"),
        ("mdm.read", "mdm", "*", "read"),
        ("strategy.plan.read", "strategy", "plan", "read"),
        ("strategy.plan.write", "strategy", "plan", "write"),
        ("planning.awp.read", "planning", "awp", "read"),
        ("planning.awp.create", "planning", "awp", "create"),
        ("planning.awp.edit", "planning", "awp", "edit"),
        ("planning.awp.submit", "planning", "awp", "submit"),
        ("planning.awp.review", "planning", "awp", "review"),
        ("planning.awp.approve", "planning", "awp", "approve"),
        ("planning.awp.close", "planning", "awp", "close"),
        ("workflow.task.read", "workflow", "task", "read"),
        ("doc.upload", "doc", "*", "upload"),
        ("doc.read", "doc", "*", "read"),
        ("audit.read", "audit", "*", "read"),
    ]
    perm_rows = ", ".join(
        f"(uuid_generate_v7(), '{c}', '{d}', '{e}', '{a}')" for c, d, e, a in permissions
    )
    op.execute(
        f"INSERT INTO iam.permissions (id, code, domain, entity, action) VALUES {perm_rows}"
    )

    roles = [
        ("super_admin", "Platform super administrator", True),
        ("ministry_executive", "Ministry executive (Minister, CMO, DPPI Director)", True),
        ("directorate_head", "Directorate head", True),
        ("programme_manager", "Programme manager", True),
        ("me_officer", "Monitoring & Evaluation officer", True),
        ("finance_officer", "Finance officer", True),
        ("district_user", "District-level user", True),
        ("facility_user", "Facility-level user", True),
        ("donor_viewer", "Donor read-only viewer", True),
        ("auditor", "Read-only auditor", True),
        ("ict_admin", "ICT administrator", True),
    ]
    role_rows = ", ".join(
        f"(uuid_generate_v7(), '{c}', '{n}', '{n}', {str(s).lower()})" for c, n, s in roles
    )
    op.execute(
        f"INSERT INTO iam.roles (id, code, name, description, is_system) VALUES {role_rows}"
    )

    op.execute(
        "INSERT INTO iam.role_permissions (role_id, permission_id) "
        "SELECT r.id, p.id FROM iam.roles r CROSS JOIN iam.permissions p "
        "WHERE r.code = 'super_admin'"
    )

    op.execute(
        "INSERT INTO mdm.currencies (code, name) VALUES "
        "('SLE', 'Sierra Leone Leone'), ('USD', 'US Dollar'),"
        "('EUR', 'Euro'), ('GBP', 'Pound Sterling')"
    )

    op.execute(
        "INSERT INTO mdm.fiscal_years (id, code, starts_on, ends_on, is_active) VALUES "
        "(uuid_generate_v7(), 'FY2026', '2026-01-01', '2026-12-31', true), "
        "(uuid_generate_v7(), 'FY2025', '2025-01-01', '2025-12-31', false), "
        "(uuid_generate_v7(), 'FY2027', '2027-01-01', '2027-12-31', false)"
    )


def downgrade() -> None:
    op.drop_table("indicator_definitions", schema="mdm")
    op.drop_table("currencies", schema="mdm")
    op.drop_table("fiscal_years", schema="mdm")

    op.drop_table("facilities", schema="org")
    op.drop_table("chiefdoms", schema="org")
    op.drop_table("districts", schema="org")
    op.drop_table("programmes", schema="org")
    op.drop_table("directorates", schema="org")

    op.drop_table("user_scopes", schema="iam")
    op.drop_table("user_roles", schema="iam")
    op.drop_table("role_permissions", schema="iam")
    op.drop_table("permissions", schema="iam")
    op.drop_table("roles", schema="iam")
    op.drop_table("users", schema="iam")

    for s in reversed(SCHEMAS):
        op.execute(f'DROP SCHEMA IF EXISTS "{s}" CASCADE')
