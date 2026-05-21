"""IAM data-access layer.

Repositories own SQL. Services do not touch the ORM directly.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.iam.models import Permission, Role, RolePermission, User, UserRole, UserScope


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: uuid.UUID) -> User | None:
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return (await self.session.scalars(stmt)).first()

    async def get_by_keycloak_sub(self, sub: str) -> User | None:
        stmt = select(User).where(User.keycloak_sub == sub)
        return (await self.session.scalars(stmt)).first()

    async def list(
        self,
        *,
        page: int = 1,
        page_size: int = 50,
        search: str | None = None,
        is_active: bool | None = None,
    ) -> tuple[list[User], int]:
        stmt = select(User).order_by(User.created_at.desc())
        count_stmt = select(func.count()).select_from(User)

        if search:
            pattern = f"%{search.lower()}%"
            stmt = stmt.where(
                func.lower(User.full_name).like(pattern) | func.lower(User.email).like(pattern)
            )
            count_stmt = count_stmt.where(
                func.lower(User.full_name).like(pattern) | func.lower(User.email).like(pattern)
            )
        if is_active is not None:
            stmt = stmt.where(User.is_active.is_(is_active))
            count_stmt = count_stmt.where(User.is_active.is_(is_active))

        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        items = list((await self.session.scalars(stmt)).all())
        total = (await self.session.execute(count_stmt)).scalar_one()
        return items, total

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.flush()
        return user

    async def delete(self, user: User) -> None:
        await self.session.delete(user)


class RoleRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self) -> list[Role]:
        stmt = select(Role).order_by(Role.code)
        return list((await self.session.scalars(stmt)).all())

    async def get_by_code(self, code: str) -> Role | None:
        stmt = select(Role).where(Role.code == code)
        return (await self.session.scalars(stmt)).first()

    async def assign_to_user(
        self, user_id: uuid.UUID, role_id: uuid.UUID, granted_by: uuid.UUID
    ) -> None:
        self.session.add(UserRole(user_id=user_id, role_id=role_id, granted_by=granted_by))
        await self.session.flush()


class PermissionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(self, user_id: uuid.UUID) -> list[str]:
        """Return the flat list of permission codes a user has via their roles."""
        stmt = (
            select(Permission.code)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(UserRole, UserRole.role_id == RolePermission.role_id)
            .where(UserRole.user_id == user_id)
            .distinct()
        )
        return list((await self.session.scalars(stmt)).all())


class ScopeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(self, user_id: uuid.UUID) -> list[UserScope]:
        stmt = select(UserScope).where(UserScope.user_id == user_id)
        return list((await self.session.scalars(stmt)).all())

    async def add(self, scope: UserScope) -> UserScope:
        self.session.add(scope)
        await self.session.flush()
        return scope

    async def remove(self, scope_id: uuid.UUID) -> None:
        scope = await self.session.get(UserScope, scope_id)
        if scope:
            await self.session.delete(scope)
