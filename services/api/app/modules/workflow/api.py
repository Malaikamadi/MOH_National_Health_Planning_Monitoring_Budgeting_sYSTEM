"""Workflow internal API — start an instance, advance a task."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.workflow.models import WorkflowInstance


@dataclass(frozen=True)
class InstanceRef:
    id: uuid.UUID
    current_state: str


async def start_workflow(
    session: AsyncSession,
    *,
    definition_id: uuid.UUID,
    target_type: str,
    target_id: uuid.UUID,
    initiator: uuid.UUID,
    initial_state: str = "submitted",
) -> InstanceRef:
    """Start a new workflow instance for a target entity (AWP, report, etc.)."""
    inst = WorkflowInstance(
        definition_id=definition_id,
        target_type=target_type,
        target_id=target_id,
        current_state=initial_state,
        initiated_by=initiator,
    )
    session.add(inst)
    await session.flush()
    return InstanceRef(id=inst.id, current_state=inst.current_state)
