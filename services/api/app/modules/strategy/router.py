"""Strategy HTTP routes (MVP minimal: list plans, list pillars, list objectives)."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.deps import DbSession
from app.core.security import require
from app.modules.strategy.models import Objective, Pillar, Plan

router = APIRouter()


@router.get(
    "/plans",
    dependencies=[Depends(require("strategy.plan.read"))],
    summary="List strategic plans",
)
async def list_plans(session: DbSession) -> list[dict]:
    rows = (await session.scalars(select(Plan).order_by(Plan.starts_on.desc()))).all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "name": r.name,
            "status": r.status,
            "starts_on": r.starts_on.isoformat(),
            "ends_on": r.ends_on.isoformat(),
        }
        for r in rows
    ]


@router.get(
    "/plans/{plan_id}/pillars",
    dependencies=[Depends(require("strategy.plan.read"))],
)
async def list_pillars(plan_id: uuid.UUID, session: DbSession) -> list[dict]:
    rows = (
        await session.scalars(
            select(Pillar).where(Pillar.plan_id == plan_id).order_by(Pillar.sort_order)
        )
    ).all()
    return [
        {"id": str(r.id), "code": r.code, "name": r.name, "sort_order": r.sort_order}
        for r in rows
    ]


@router.get(
    "/pillars/{pillar_id}/objectives",
    dependencies=[Depends(require("strategy.plan.read"))],
)
async def list_objectives(pillar_id: uuid.UUID, session: DbSession) -> list[dict]:
    rows = (
        await session.scalars(
            select(Objective).where(Objective.pillar_id == pillar_id).order_by(Objective.code)
        )
    ).all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "name": r.name,
            "owner_directorate_id": str(r.owner_directorate_id) if r.owner_directorate_id else None,
            "outcome_indicator_id": str(r.outcome_indicator_id) if r.outcome_indicator_id else None,
        }
        for r in rows
    ]
