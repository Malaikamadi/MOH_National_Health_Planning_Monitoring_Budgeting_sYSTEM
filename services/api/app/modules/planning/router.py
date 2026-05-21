"""Planning HTTP routes."""

from __future__ import annotations

import uuid
from typing import Annotated, Literal

from fastapi import APIRouter, Body, Depends, Query, status

from app.core.deps import DbSession
from app.core.security import CurrentPrincipal, require
from app.modules.planning.schemas import (
    AwpActivityCreate,
    AwpActivityOut,
    AwpCreate,
    AwpOut,
    AwpStatus,
)
from app.modules.planning.service import PlanningService

router = APIRouter()


# ---------- AWP ----------


@router.get(
    "/awps",
    response_model=list[AwpOut],
    dependencies=[Depends(require("planning.awp.read"))],
    summary="List AWPs",
)
async def list_awps(
    session: DbSession,
    status_filter: Annotated[AwpStatus | None, Query(alias="status")] = None,
) -> list[AwpOut]:
    svc = PlanningService(session)
    items = await svc.awps.list(status=status_filter)
    return [AwpOut.model_validate(a) for a in items]


@router.post(
    "/awps",
    response_model=AwpOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("planning.awp.create"))],
)
async def create_awp(payload: AwpCreate, session: DbSession) -> AwpOut:
    svc = PlanningService(session)
    awp = await svc.create_awp(payload)
    await session.commit()
    return AwpOut.model_validate(awp)


@router.get(
    "/awps/{awp_id}",
    response_model=AwpOut,
    dependencies=[Depends(require("planning.awp.read"))],
)
async def get_awp(awp_id: uuid.UUID, session: DbSession) -> AwpOut:
    svc = PlanningService(session)
    awp = await svc.get_awp(awp_id)
    return AwpOut.model_validate(awp)


@router.post(
    "/awps/{awp_id}/transition",
    response_model=AwpOut,
    summary="Move an AWP to a new state (submit, approve, etc.)",
)
async def transition_awp(
    awp_id: uuid.UUID,
    session: DbSession,
    principal: CurrentPrincipal,
    to: Annotated[
        Literal["submitted", "under_review", "revisions_requested", "approved", "active", "closed"],
        Body(embed=True),
    ],
) -> AwpOut:
    perm_map = {
        "submitted": "planning.awp.submit",
        "under_review": "planning.awp.review",
        "revisions_requested": "planning.awp.review",
        "approved": "planning.awp.approve",
        "active": "planning.awp.approve",
        "closed": "planning.awp.close",
    }
    required = perm_map[to]
    if not principal.has_permission(required):
        from app.core.errors import PermissionDenied

        raise PermissionDenied(
            f"Missing permission: {required}", {"required_permission": required}
        )

    svc = PlanningService(session)
    awp = await svc.transition_awp(awp_id, to=to, actor=principal.user_id)
    await session.commit()
    return AwpOut.model_validate(awp)


# ---------- Activities ----------


@router.get(
    "/awps/{awp_id}/activities",
    response_model=list[AwpActivityOut],
    dependencies=[Depends(require("planning.awp.read"))],
)
async def list_activities(awp_id: uuid.UUID, session: DbSession) -> list[AwpActivityOut]:
    svc = PlanningService(session)
    items = await svc.activities.list_for_awp(awp_id)
    return [AwpActivityOut.model_validate(a) for a in items]


@router.post(
    "/awps/{awp_id}/activities",
    response_model=AwpActivityOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("planning.awp.edit"))],
)
async def create_activity(
    awp_id: uuid.UUID, payload: AwpActivityCreate, session: DbSession
) -> AwpActivityOut:
    svc = PlanningService(session)
    activity = await svc.add_activity(awp_id, payload)
    await session.commit()
    return AwpActivityOut.model_validate(activity)
