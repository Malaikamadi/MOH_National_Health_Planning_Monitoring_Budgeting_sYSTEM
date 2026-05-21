"""MDM internal API."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.mdm.models import FiscalYear, IndicatorDefinition


@dataclass(frozen=True)
class IndicatorRef:
    id: uuid.UUID
    code: str
    name_en: str
    data_type: str


async def get_indicator(session: AsyncSession, indicator_id: uuid.UUID) -> IndicatorRef | None:
    row = await session.get(IndicatorDefinition, indicator_id)
    if not row:
        return None
    return IndicatorRef(id=row.id, code=row.code, name_en=row.name_en, data_type=row.data_type)


async def get_active_fiscal_year(session: AsyncSession) -> FiscalYear | None:
    return (
        await session.scalars(
            select(FiscalYear).where(FiscalYear.is_active.is_(True)).limit(1)
        )
    ).first()
