"""Workflow HTTP routes (MVP: list my tasks)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.deps import DbSession
from app.core.security import CurrentPrincipal, require
from app.modules.workflow.models import WorkflowTask

router = APIRouter()


@router.get(
    "/tasks/me",
    dependencies=[Depends(require("workflow.task.read"))],
    summary="List workflow tasks assigned to the current user",
)
async def list_my_tasks(session: DbSession, principal: CurrentPrincipal) -> list[dict]:
    stmt = (
        select(WorkflowTask)
        .where(WorkflowTask.assignee_user_id == principal.user_id)
        .where(WorkflowTask.state.in_(["pending", "in_progress"]))
        .order_by(WorkflowTask.due_at.asc().nulls_last())
    )
    rows = (await session.scalars(stmt)).all()
    return [
        {
            "id": str(r.id),
            "instance_id": str(r.instance_id),
            "name": r.name,
            "state": r.state,
            "due_at": r.due_at.isoformat() if r.due_at else None,
        }
        for r in rows
    ]
