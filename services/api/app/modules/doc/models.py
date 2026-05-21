"""Documents ORM model — polymorphic linkage to source entities."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    ARRAY,
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, IdMixin

SCHEMA = "doc"


class Document(Base, IdMixin):
    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint(
            "sensitivity IN ('public','internal','restricted','confidential')",
            name="document_sensitivity_valid",
        ),
        Index("ix_documents_linked", "linked_entity", "linked_entity_id"),
        Index("ix_documents_hash", "content_sha256"),
        Index("ix_documents_tags", "tags", postgresql_using="gin"),
        {"schema": SCHEMA},
    )

    name: Mapped[str] = mapped_column(String(512), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(128), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    content_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False)
    storage_bucket: Mapped[str] = mapped_column(String(128), nullable=False)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id"), nullable=False
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    virus_scanned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    virus_scan_result: Mapped[str | None] = mapped_column(String(32))
    linked_entity: Mapped[str] = mapped_column(String(64), nullable=False)
    linked_entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    sensitivity: Mapped[str] = mapped_column(
        String(32), nullable=False, default="internal", server_default="internal"
    )
