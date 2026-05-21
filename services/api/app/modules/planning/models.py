"""Planning ORM models — AWP centrepiece."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, IdMixin, Timestamped, Versioned

SCHEMA = "planning"


class AnnualWorkPlan(Base, IdMixin, Timestamped, Versioned):
    __tablename__ = "annual_work_plans"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft','submitted','under_review','revisions_requested','approved','active','closed')",
            name="awp_status_valid",
        ),
        UniqueConstraint(
            "fiscal_year_id", "directorate_id", name="uq_awp__fy_directorate"
        ),
        {"schema": SCHEMA},
    )

    fiscal_year_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mdm.fiscal_years.id"), nullable=False
    )
    directorate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("org.directorates.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    total_budget: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    currency_code: Mapped[str] = mapped_column(
        String(3), ForeignKey("mdm.currencies.code"), nullable=False, default="SLE"
    )

    activities: Mapped[list["AwpActivity"]] = relationship(
        back_populates="awp", cascade="all, delete-orphan"
    )


class AwpActivity(Base, IdMixin, Timestamped):
    __tablename__ = "awp_activities"
    __table_args__ = (
        CheckConstraint("ends_on >= starts_on", name="awp_activity_period_valid"),
        CheckConstraint(
            "progress_pct IS NULL OR (progress_pct BETWEEN 0 AND 100)",
            name="awp_activity_progress_valid",
        ),
        CheckConstraint(
            "status IN ('planned','in_progress','delayed','completed','cancelled')",
            name="awp_activity_status_valid",
        ),
        UniqueConstraint("awp_id", "code", name="uq_awp_activities__awp_code"),
        Index("ix_awp_activities_awp", "awp_id"),
        Index("ix_awp_activities_objective", "objective_id"),
        Index(
            "ix_awp_activities_executor", "executor_org_id", "executor_org_type"
        ),
        Index("ix_awp_activities_period", "starts_on", "ends_on"),
        {"schema": SCHEMA},
    )

    awp_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(f"{SCHEMA}.annual_work_plans.id", ondelete="CASCADE"),
        nullable=False,
    )
    objective_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("strategy.objectives.id"), nullable=False
    )
    programme_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("org.programmes.id")
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    owner_org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    executor_org_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    executor_org_type: Mapped[str | None] = mapped_column(String(32))
    starts_on: Mapped[date] = mapped_column(Date, nullable=False)
    ends_on: Mapped[date] = mapped_column(Date, nullable=False)
    expected_output: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="planned")
    progress_pct: Mapped[int | None] = mapped_column(SmallInteger)

    awp: Mapped["AnnualWorkPlan"] = relationship(back_populates="activities")
