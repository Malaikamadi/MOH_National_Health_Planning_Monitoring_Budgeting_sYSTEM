"""Org internal Python interface — the only path other modules may import."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.org.service import OrgService


@dataclass(frozen=True)
class DirectorateSummary:
    id: uuid.UUID
    code: str
    name: str
    is_active: bool


@dataclass(frozen=True)
class ProgrammeSummary:
    id: uuid.UUID
    code: str
    name: str
    directorate_id: uuid.UUID


async def get_directorate_summary(
    session: AsyncSession, directorate_id: uuid.UUID
) -> DirectorateSummary | None:
    svc = OrgService(session)
    d = await svc.directorates.get(directorate_id)
    if not d:
        return None
    return DirectorateSummary(id=d.id, code=d.code, name=d.name, is_active=d.is_active)


async def directorate_exists(session: AsyncSession, directorate_id: uuid.UUID) -> bool:
    return await get_directorate_summary(session, directorate_id) is not None
