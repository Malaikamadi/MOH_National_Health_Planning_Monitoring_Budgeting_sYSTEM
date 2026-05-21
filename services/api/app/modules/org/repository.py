"""Org data-access layer."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.org.models import Directorate, District, Facility, Programme


class DirectorateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self, *, is_active: bool | None = None) -> list[Directorate]:
        stmt = select(Directorate).order_by(Directorate.code)
        if is_active is not None:
            stmt = stmt.where(Directorate.is_active.is_(is_active))
        return list((await self.session.scalars(stmt)).all())

    async def get(self, directorate_id: uuid.UUID) -> Directorate | None:
        return await self.session.get(Directorate, directorate_id)

    async def get_by_code(self, code: str) -> Directorate | None:
        stmt = select(Directorate).where(Directorate.code == code)
        return (await self.session.scalars(stmt)).first()

    async def create(self, d: Directorate) -> Directorate:
        self.session.add(d)
        await self.session.flush()
        return d


class ProgrammeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_directorate(self, directorate_id: uuid.UUID) -> list[Programme]:
        stmt = (
            select(Programme)
            .where(Programme.directorate_id == directorate_id)
            .order_by(Programme.code)
        )
        return list((await self.session.scalars(stmt)).all())

    async def create(self, p: Programme) -> Programme:
        self.session.add(p)
        await self.session.flush()
        return p


class DistrictRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self) -> list[District]:
        stmt = select(District).order_by(District.name)
        return list((await self.session.scalars(stmt)).all())


class FacilityRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(
        self,
        *,
        district_id: uuid.UUID | None = None,
        page: int = 1,
        page_size: int = 50,
        search: str | None = None,
    ) -> tuple[list[Facility], int]:
        stmt = select(Facility).order_by(Facility.name)
        count_stmt = select(func.count()).select_from(Facility)
        if district_id:
            stmt = stmt.where(Facility.district_id == district_id)
            count_stmt = count_stmt.where(Facility.district_id == district_id)
        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(func.lower(Facility.name).like(pattern))
            count_stmt = count_stmt.where(func.lower(Facility.name).like(pattern))
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        items = list((await self.session.scalars(stmt)).all())
        total = (await self.session.execute(count_stmt)).scalar_one()
        return items, total
