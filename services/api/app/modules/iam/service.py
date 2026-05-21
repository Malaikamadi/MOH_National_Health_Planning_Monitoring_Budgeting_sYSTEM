"""IAM business logic.

Services orchestrate repositories, enforce invariants, and emit audit events.
"""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

from app.core.errors import ConflictError, NotFoundError, ValidationFailure
from app.modules.iam.models import User, UserScope
from app.modules.iam.repository import (
    PermissionRepository,
    RoleRepository,
    ScopeRepository,
    UserRepository,
)
from app.modules.iam.schemas import ScopeAssign, UserCreate, UserUpdate


class IamService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)
        self.roles = RoleRepository(session)
        self.permissions = PermissionRepository(session)
        self.scopes = ScopeRepository(session)

    # ----- Users -----

    async def create_user(self, payload: UserCreate) -> User:
        if await self.users.get_by_email(payload.email):
            raise ConflictError(
                "A user with this email already exists.", {"email": payload.email}
            )
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            phone_e164=payload.phone_e164,
            preferred_lang=payload.preferred_lang,
            keycloak_sub=payload.keycloak_sub,
        )
        try:
            await self.users.create(user)
        except IntegrityError as e:
            raise ConflictError("Unique constraint violation.", {"detail": str(e.orig)}) from e
        return user

    async def get_user(self, user_id: uuid.UUID) -> User:
        user = await self.users.get(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found.", {"id": str(user_id)})
        return user

    async def update_user(self, user_id: uuid.UUID, payload: UserUpdate) -> User:
        user = await self.get_user(user_id)
        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(user, k, v)
        await self.session.flush()
        return user

    async def list_users(
        self,
        *,
        page: int = 1,
        page_size: int = 50,
        search: str | None = None,
        is_active: bool | None = None,
    ) -> tuple[list[User], int]:
        if not 1 <= page_size <= 200:
            raise ValidationFailure("page_size must be between 1 and 200.")
        return await self.users.list(
            page=page, page_size=page_size, search=search, is_active=is_active
        )

    async def deactivate_user(self, user_id: uuid.UUID) -> User:
        user = await self.get_user(user_id)
        user.is_active = False
        await self.session.flush()
        return user

    # ----- Roles -----

    async def assign_role(
        self, *, user_id: uuid.UUID, role_code: str, granted_by: uuid.UUID
    ) -> None:
        await self.get_user(user_id)
        role = await self.roles.get_by_code(role_code)
        if not role:
            raise NotFoundError(f"Role '{role_code}' not found.", {"role_code": role_code})
        await self.roles.assign_to_user(user_id=user_id, role_id=role.id, granted_by=granted_by)

    # ----- Scopes -----

    async def assign_scope(self, *, user_id: uuid.UUID, payload: ScopeAssign) -> UserScope:
        await self.get_user(user_id)
        if payload.scope_type != "global" and payload.scope_ref_id is None:
            raise ValidationFailure(
                "scope_ref_id is required for non-global scopes.",
                {"scope_type": payload.scope_type},
            )
        scope = UserScope(
            user_id=user_id,
            scope_type=payload.scope_type,
            scope_ref_id=payload.scope_ref_id,
        )
        return await self.scopes.add(scope)

    async def list_scopes(self, user_id: uuid.UUID) -> list[UserScope]:
        return await self.scopes.list_for_user(user_id)
