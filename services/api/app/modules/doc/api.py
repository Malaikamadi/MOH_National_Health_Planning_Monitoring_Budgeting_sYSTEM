"""Documents internal API — attach/detach to a source entity."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.doc.models import Document


@dataclass(frozen=True)
class DocumentRef:
    id: uuid.UUID
    name: str
    mime_type: str
    storage_key: str


async def list_for_entity(
    session: AsyncSession, *, entity_type: str, entity_id: uuid.UUID
) -> list[DocumentRef]:
    rows = (
        await session.scalars(
            select(Document).where(
                Document.linked_entity == entity_type,
                Document.linked_entity_id == entity_id,
            )
        )
    ).all()
    return [DocumentRef(id=d.id, name=d.name, mime_type=d.mime_type, storage_key=d.storage_key) for d in rows]
