"""Audit ORM model — append-only event log."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, IdMixin

SCHEMA = "audit"


class EventLog(Base, IdMixin):
    __tablename__ = "event_log"
    __table_args__ = (
        Index("ix_audit_entity", "entity_schema", "entity_table", "entity_id"),
        Index("ix_audit_actor", "actor_user_id", "occurred_at"),
        {"schema": SCHEMA},
    )

    sequence_no: Mapped[int] = mapped_column(BigInteger, nullable=False, autoincrement=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=text("now()")
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    actor_role: Mapped[str | None] = mapped_column(String(64))
    actor_ip: Mapped[str | None] = mapped_column(INET)
    actor_device_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    entity_schema: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_table: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    before_state: Mapped[dict | None] = mapped_column(JSONB)
    after_state: Mapped[dict | None] = mapped_column(JSONB)
    request_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    prev_hash: Mapped[str | None] = mapped_column(String(64))
    row_hash: Mapped[str] = mapped_column(String(64), nullable=False)
