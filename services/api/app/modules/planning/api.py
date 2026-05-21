"""Planning internal API — what other modules use to read/write AWP state."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.planning.service import PlanningService


@dataclass(frozen=True)
class AwpRef:
    id: uuid.UUID
    fiscal_year_id: uuid.UUID
    directorate_id: uuid.UUID
    status: str


async def get_awp_ref(session: AsyncSession, awp_id: uuid.UUID) -> AwpRef | None:
    svc = PlanningService(session)
    awp = await svc.awps.get(awp_id)
    if not awp:
        return None
    return AwpRef(
        id=awp.id,
        fiscal_year_id=awp.fiscal_year_id,
        directorate_id=awp.directorate_id,
        status=awp.status,
    )
