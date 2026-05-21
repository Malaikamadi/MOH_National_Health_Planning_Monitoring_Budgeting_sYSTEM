"""IAM **internal** Python interface.

Other modules MUST import only from this file — never from
``app.modules.iam.models`` / ``.repository`` / ``.service`` directly.
``import-linter`` enforces this in CI (see ``pyproject.toml``).

This is the public contract for cross-module collaboration.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.iam.service import IamService


@dataclass(frozen=True)
class UserSummary:
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool


async def get_user_summary(session: AsyncSession, user_id: uuid.UUID) -> UserSummary | None:
    """Return a thin user summary for another module to display/audit."""
    svc = IamService(session)
    user = await svc.users.get(user_id)
    if not user:
        return None
    return UserSummary(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


async def user_has_scope(
    session: AsyncSession,
    user_id: uuid.UUID,
    scope_type: str,
    scope_ref_id: uuid.UUID | None,
) -> bool:
    """Programmatic scope check (the DB RLS policy is the authoritative gate)."""
    svc = IamService(session)
    scopes = await svc.scopes.list_for_user(user_id)
    return any(
        s.scope_type == "global"
        or (s.scope_type == scope_type and s.scope_ref_id == scope_ref_id)
        for s in scopes
    )
