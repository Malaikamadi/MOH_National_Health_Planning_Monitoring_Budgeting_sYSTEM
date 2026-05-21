"""IAM HTTP routes."""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status

from app.core.deps import DbSession
from app.core.security import CurrentPrincipal, require
from app.modules.iam.schemas import (
    Page,
    ScopeAssign,
    ScopeOut,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.modules.iam.service import IamService

router = APIRouter()


# ---------- Me ----------


@router.get("/me", response_model=UserOut, summary="Get the currently authenticated user")
async def get_me(session: DbSession, principal: CurrentPrincipal) -> UserOut:
    svc = IamService(session)
    user = await svc.get_user(principal.user_id)
    return UserOut.model_validate(user)


# ---------- Users ----------


@router.get(
    "/users",
    response_model=Page[UserOut],
    dependencies=[Depends(require("iam.users.read"))],
    summary="List users",
)
async def list_users(
    session: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=200)] = 50,
    search: Annotated[str | None, Query(max_length=200)] = None,
    is_active: Annotated[bool | None, Query()] = None,
) -> Page[UserOut]:
    svc = IamService(session)
    items, total = await svc.list_users(
        page=page, page_size=page_size, search=search, is_active=is_active
    )
    return Page[UserOut](
        items=[UserOut.model_validate(u) for u in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("iam.users.create"))],
    summary="Create a new user",
)
async def create_user(payload: UserCreate, session: DbSession) -> UserOut:
    svc = IamService(session)
    user = await svc.create_user(payload)
    await session.commit()
    return UserOut.model_validate(user)


@router.get(
    "/users/{user_id}",
    response_model=UserOut,
    dependencies=[Depends(require("iam.users.read"))],
    summary="Get a user by ID",
)
async def get_user(user_id: uuid.UUID, session: DbSession) -> UserOut:
    svc = IamService(session)
    user = await svc.get_user(user_id)
    return UserOut.model_validate(user)


@router.patch(
    "/users/{user_id}",
    response_model=UserOut,
    dependencies=[Depends(require("iam.users.update"))],
    summary="Update a user",
)
async def update_user(
    user_id: uuid.UUID, payload: UserUpdate, session: DbSession
) -> UserOut:
    svc = IamService(session)
    user = await svc.update_user(user_id, payload)
    await session.commit()
    return UserOut.model_validate(user)


@router.post(
    "/users/{user_id}/deactivate",
    response_model=UserOut,
    dependencies=[Depends(require("iam.users.deactivate"))],
    summary="Deactivate a user (soft disable)",
)
async def deactivate_user(user_id: uuid.UUID, session: DbSession) -> UserOut:
    svc = IamService(session)
    user = await svc.deactivate_user(user_id)
    await session.commit()
    return UserOut.model_validate(user)


# ---------- Roles ----------


@router.post(
    "/users/{user_id}/roles/{role_code}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    dependencies=[Depends(require("iam.roles.assign"))],
    summary="Assign a role to a user",
)
async def assign_role(
    user_id: uuid.UUID,
    role_code: str,
    session: DbSession,
    principal: CurrentPrincipal,
) -> Response:
    svc = IamService(session)
    await svc.assign_role(user_id=user_id, role_code=role_code, granted_by=principal.user_id)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ---------- Scopes ----------


@router.get(
    "/users/{user_id}/scopes",
    response_model=list[ScopeOut],
    dependencies=[Depends(require("iam.users.read"))],
    summary="List scopes assigned to a user",
)
async def list_scopes(user_id: uuid.UUID, session: DbSession) -> list[ScopeOut]:
    svc = IamService(session)
    scopes = await svc.list_scopes(user_id)
    return [ScopeOut.model_validate(s) for s in scopes]


@router.post(
    "/users/{user_id}/scopes",
    response_model=ScopeOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("iam.scopes.assign"))],
    summary="Assign an organisational scope to a user",
)
async def assign_scope(
    user_id: uuid.UUID, payload: ScopeAssign, session: DbSession
) -> ScopeOut:
    svc = IamService(session)
    scope = await svc.assign_scope(user_id=user_id, payload=payload)
    await session.commit()
    return ScopeOut.model_validate(scope)
