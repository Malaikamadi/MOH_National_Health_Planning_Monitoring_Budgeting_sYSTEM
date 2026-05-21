"""Audit internal API — :func:`record` is the only entry point other modules use."""

from __future__ import annotations

import hashlib
import json
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.audit.models import EventLog


def _canonical(payload: dict[str, Any] | None) -> str:
    return json.dumps(payload or {}, sort_keys=True, separators=(",", ":"), default=str)


async def record(
    session: AsyncSession,
    *,
    actor_user_id: uuid.UUID | None,
    actor_role: str | None,
    action: str,
    entity_schema: str,
    entity_table: str,
    entity_id: uuid.UUID | None,
    before_state: dict[str, Any] | None = None,
    after_state: dict[str, Any] | None = None,
    request_id: uuid.UUID | None = None,
) -> EventLog:
    """Append a hash-chained audit event.

    Computes ``row_hash = sha256(prev_hash || canonical_payload)`` so any
    tampering with the log is detectable end-to-end.
    """
    prev_hash = (
        await session.scalars(
            select(EventLog.row_hash).order_by(EventLog.sequence_no.desc()).limit(1)
        )
    ).first()

    payload = {
        "actor_user_id": str(actor_user_id) if actor_user_id else None,
        "action": action,
        "entity_schema": entity_schema,
        "entity_table": entity_table,
        "entity_id": str(entity_id) if entity_id else None,
        "before_state": before_state,
        "after_state": after_state,
    }
    h = hashlib.sha256(((prev_hash or "") + _canonical(payload)).encode()).hexdigest()

    evt = EventLog(
        actor_user_id=actor_user_id,
        actor_role=actor_role,
        action=action,
        entity_schema=entity_schema,
        entity_table=entity_table,
        entity_id=entity_id,
        before_state=before_state,
        after_state=after_state,
        request_id=request_id,
        prev_hash=prev_hash,
        row_hash=h,
    )
    session.add(evt)
    await session.flush()
    return evt
