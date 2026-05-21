"""Org HTTP routes."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.core.deps import DbSession
from app.core.security import require
from app.modules.org.schemas import (
    DirectorateCreate,
    DirectorateOut,
    DirectorateUpdate,
    DistrictOut,
    FacilityOut,
    ProgrammeCreate,
    ProgrammeOut,
)
from app.modules.org.service import OrgService

router = APIRouter()


# ---------- Directorates ----------


@router.get(
    "/directorates",
    response_model=list[DirectorateOut],
    dependencies=[Depends(require("org.directorate.read"))],
    summary="List directorates",
)
async def list_directorates(
    session: DbSession,
    is_active: Annotated[bool | None, Query()] = None,
) -> list[DirectorateOut]:
    svc = OrgService(session)
    items = await svc.list_directorates(is_active=is_active)
    return [DirectorateOut.model_validate(d) for d in items]


@router.post(
    "/directorates",
    response_model=DirectorateOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("org.directorate.create"))],
    summary="Create a directorate",
)
async def create_directorate(
    payload: DirectorateCreate, session: DbSession
) -> DirectorateOut:
    svc = OrgService(session)
    d = await svc.create_directorate(payload)
    await session.commit()
    return DirectorateOut.model_validate(d)


@router.get(
    "/directorates/{directorate_id}",
    response_model=DirectorateOut,
    dependencies=[Depends(require("org.directorate.read"))],
)
async def get_directorate(directorate_id: uuid.UUID, session: DbSession) -> DirectorateOut:
    svc = OrgService(session)
    d = await svc.get_directorate(directorate_id)
    return DirectorateOut.model_validate(d)


@router.patch(
    "/directorates/{directorate_id}",
    response_model=DirectorateOut,
    dependencies=[Depends(require("org.directorate.update"))],
)
async def update_directorate(
    directorate_id: uuid.UUID, payload: DirectorateUpdate, session: DbSession
) -> DirectorateOut:
    svc = OrgService(session)
    d = await svc.update_directorate(directorate_id, payload)
    await session.commit()
    return DirectorateOut.model_validate(d)


# ---------- Programmes ----------


@router.get(
    "/directorates/{directorate_id}/programmes",
    response_model=list[ProgrammeOut],
    dependencies=[Depends(require("org.programme.read"))],
)
async def list_programmes(
    directorate_id: uuid.UUID, session: DbSession
) -> list[ProgrammeOut]:
    svc = OrgService(session)
    items = await svc.list_programmes(directorate_id)
    return [ProgrammeOut.model_validate(p) for p in items]


@router.post(
    "/programmes",
    response_model=ProgrammeOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("org.programme.create"))],
)
async def create_programme(payload: ProgrammeCreate, session: DbSession) -> ProgrammeOut:
    svc = OrgService(session)
    p = await svc.create_programme(payload)
    await session.commit()
    return ProgrammeOut.model_validate(p)


# ---------- Districts / Facilities (read-only in MVP) ----------


@router.get(
    "/districts",
    response_model=list[DistrictOut],
    dependencies=[Depends(require("org.district.read"))],
)
async def list_districts(session: DbSession) -> list[DistrictOut]:
    svc = OrgService(session)
    items = await svc.districts.list()
    return [DistrictOut.model_validate(d) for d in items]


@router.get(
    "/facilities",
    response_model=list[FacilityOut],
    dependencies=[Depends(require("org.facility.read"))],
)
async def list_facilities(
    session: DbSession,
    district_id: Annotated[uuid.UUID | None, Query()] = None,
    search: Annotated[str | None, Query(max_length=200)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[FacilityOut]:
    svc = OrgService(session)
    items, _ = await svc.facilities.list(
        district_id=district_id, page=page, page_size=page_size, search=search
    )
    return [FacilityOut.model_validate(f) for f in items]
