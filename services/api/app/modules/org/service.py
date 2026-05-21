"""Org business logic."""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError
from app.modules.org.models import Directorate, Programme
from app.modules.org.repository import (
    DirectorateRepository,
    DistrictRepository,
    FacilityRepository,
    ProgrammeRepository,
)
from app.modules.org.schemas import (
    DirectorateCreate,
    DirectorateUpdate,
    ProgrammeCreate,
)


class OrgService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.directorates = DirectorateRepository(session)
        self.programmes = ProgrammeRepository(session)
        self.districts = DistrictRepository(session)
        self.facilities = FacilityRepository(session)

    # ----- Directorates -----

    async def list_directorates(self, *, is_active: bool | None = None) -> list[Directorate]:
        return await self.directorates.list(is_active=is_active)

    async def get_directorate(self, directorate_id: uuid.UUID) -> Directorate:
        d = await self.directorates.get(directorate_id)
        if not d:
            raise NotFoundError(
                f"Directorate {directorate_id} not found.", {"id": str(directorate_id)}
            )
        return d

    async def create_directorate(self, payload: DirectorateCreate) -> Directorate:
        if await self.directorates.get_by_code(payload.code):
            raise ConflictError(
                f"Directorate code '{payload.code}' already exists.", {"code": payload.code}
            )
        d = Directorate(
            code=payload.code,
            name=payload.name,
            parent_id=payload.parent_id,
            head_user_id=payload.head_user_id,
            valid_from=payload.valid_from,
        )
        return await self.directorates.create(d)

    async def update_directorate(
        self, directorate_id: uuid.UUID, payload: DirectorateUpdate
    ) -> Directorate:
        d = await self.get_directorate(directorate_id)
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(d, k, v)
        await self.session.flush()
        return d

    # ----- Programmes -----

    async def list_programmes(self, directorate_id: uuid.UUID) -> list[Programme]:
        await self.get_directorate(directorate_id)
        return await self.programmes.list_for_directorate(directorate_id)

    async def create_programme(self, payload: ProgrammeCreate) -> Programme:
        await self.get_directorate(payload.directorate_id)
        p = Programme(
            code=payload.code,
            name=payload.name,
            directorate_id=payload.directorate_id,
            manager_user_id=payload.manager_user_id,
            description=payload.description,
        )
        return await self.programmes.create(p)
