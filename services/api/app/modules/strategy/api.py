"""Strategy internal API."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.strategy.models import Objective


@dataclass(frozen=True)
class ObjectiveRef:
    id: uuid.UUID
    code: str
    name: str


async def get_objective(session: AsyncSession, objective_id: uuid.UUID) -> ObjectiveRef | None:
    o = await session.get(Objective, objective_id)
    if not o:
        return None
    return ObjectiveRef(id=o.id, code=o.code, name=o.name)
