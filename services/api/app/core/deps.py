"""Common FastAPI dependencies wrapped as Annotated types for readability."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_session, set_request_user_id
from app.core.security import Principal, get_principal


async def get_authenticated_session(
    principal: Annotated[Principal, Depends(get_principal)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> AsyncSession:
    """Yields a session with the current user bound for RLS predicates."""
    await set_request_user_id(session, principal.user_id)
    return session


DbSession = Annotated[AsyncSession, Depends(get_authenticated_session)]
"""The session every authenticated endpoint should use."""

UnauthDbSession = Annotated[AsyncSession, Depends(get_session)]
"""Unauthenticated session — only for ``/healthz`` and login endpoints."""
