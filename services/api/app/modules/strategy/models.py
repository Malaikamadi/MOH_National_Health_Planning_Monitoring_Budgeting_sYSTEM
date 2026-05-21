"""Strategy ORM models — plans, pillars, objectives."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, IdMixin, Timestamped, Versioned

SCHEMA = "strategy"


class Plan(Base, IdMixin, Timestamped, Versioned):
    __tablename__ = "plans"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft','approved','published','superseded','archived')",
            name="plan_status_valid",
        ),
        {"schema": SCHEMA},
    )

    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    starts_on: Mapped[date] = mapped_column(Date, nullable=False)
    ends_on: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    vision: Mapped[str | None] = mapped_column(Text)
    mission: Mapped[str | None] = mapped_column(Text)
    document_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))

    pillars: Mapped[list["Pillar"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class Pillar(Base, IdMixin):
    __tablename__ = "pillars"
    __table_args__ = (
        UniqueConstraint("plan_id", "code", name="uq_pillars__plan_code"),
        {"schema": SCHEMA},
    )

    plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(f"{SCHEMA}.plans.id", ondelete="CASCADE"),
        nullable=False,
    )
    code: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    plan: Mapped["Plan"] = relationship(back_populates="pillars")
    objectives: Mapped[list["Objective"]] = relationship(
        back_populates="pillar", cascade="all, delete-orphan"
    )


class Objective(Base, IdMixin):
    __tablename__ = "objectives"
    __table_args__ = (
        UniqueConstraint("pillar_id", "code", name="uq_objectives__pillar_code"),
        {"schema": SCHEMA},
    )

    pillar_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(f"{SCHEMA}.pillars.id", ondelete="CASCADE"),
        nullable=False,
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    owner_directorate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("org.directorates.id")
    )
    outcome_indicator_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mdm.indicator_definitions.id")
    )

    pillar: Mapped["Pillar"] = relationship(back_populates="objectives")
