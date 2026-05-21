"""Audit HTTP routes — query the immutable log."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.core.deps import DbSession
from app.core.security import require
from app.modules.audit.models import EventLog

router = APIRouter()


@router.get(
    "/events",
    dependencies=[Depends(require("audit.read"))],
    summary="Query audit events",
)
async def list_events(
    session: DbSession,
    entity_table: Annotated[str | None, Query()] = None,
    entity_id: Annotated[uuid.UUID | None, Query()] = None,
    actor_user_id: Annotated[uuid.UUID | None, Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 50,
) -> list[dict]:
    stmt = select(EventLog).order_by(EventLog.occurred_at.desc())
    if entity_table:
        stmt = stmt.where(EventLog.entity_table == entity_table)
    if entity_id:
        stmt = stmt.where(EventLog.entity_id == entity_id)
    if actor_user_id:
        stmt = stmt.where(EventLog.actor_user_id == actor_user_id)
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    rows = (await session.scalars(stmt)).all()
    return [
        {
            "id": str(r.id),
            "sequence_no": r.sequence_no,
            "occurred_at": r.occurred_at.isoformat(),
            "actor_user_id": str(r.actor_user_id) if r.actor_user_id else None,
            "action": r.action,
            "entity_schema": r.entity_schema,
            "entity_table": r.entity_table,
            "entity_id": str(r.entity_id) if r.entity_id else None,
        }
        for r in rows
    ]
