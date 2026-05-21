"""Planning data-access layer."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.planning.models import AnnualWorkPlan, AwpActivity


class AwpRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, awp_id: uuid.UUID) -> AnnualWorkPlan | None:
        return await self.session.get(AnnualWorkPlan, awp_id)

    async def get_for_fy_directorate(
        self, fiscal_year_id: uuid.UUID, directorate_id: uuid.UUID
    ) -> AnnualWorkPlan | None:
        stmt = select(AnnualWorkPlan).where(
            AnnualWorkPlan.fiscal_year_id == fiscal_year_id,
            AnnualWorkPlan.directorate_id == directorate_id,
        )
        return (await self.session.scalars(stmt)).first()

    async def list(self, *, status: str | None = None) -> list[AnnualWorkPlan]:
        stmt = select(AnnualWorkPlan).order_by(AnnualWorkPlan.created_at.desc())
        if status:
            stmt = stmt.where(AnnualWorkPlan.status == status)
        return list((await self.session.scalars(stmt)).all())

    async def create(self, awp: AnnualWorkPlan) -> AnnualWorkPlan:
        self.session.add(awp)
        await self.session.flush()
        return awp


class AwpActivityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_awp(self, awp_id: uuid.UUID) -> list[AwpActivity]:
        stmt = select(AwpActivity).where(AwpActivity.awp_id == awp_id).order_by(AwpActivity.code)
        return list((await self.session.scalars(stmt)).all())

    async def create(self, a: AwpActivity) -> AwpActivity:
        self.session.add(a)
        await self.session.flush()
        return a
