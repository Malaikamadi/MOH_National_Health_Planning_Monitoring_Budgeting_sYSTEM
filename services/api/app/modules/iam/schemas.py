"""IAM Pydantic schemas (API DTOs).

These are the contract surface — they end up in the OpenAPI document and
in the auto-generated TypeScript client.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

LangCode = Annotated[str, StringConstraints(pattern=r"^(en|kri|fr)$")]
ScopeType = Literal["global", "directorate", "programme", "district", "facility", "funding_source"]


class _ApiModel(BaseModel):
    """Base model with strict, API-friendly defaults."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True, str_strip_whitespace=True)


# ----- Users -----


class UserCreate(_ApiModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=255)
    phone_e164: str | None = Field(default=None, pattern=r"^\+[1-9]\d{6,14}$")
    preferred_lang: LangCode = "en"
    keycloak_sub: str = Field(min_length=1, description="OIDC subject from Keycloak")


class UserUpdate(_ApiModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    phone_e164: str | None = Field(default=None, pattern=r"^\+[1-9]\d{6,14}$")
    preferred_lang: LangCode | None = None
    is_active: bool | None = None


class UserOut(_ApiModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    phone_e164: str | None
    preferred_lang: str
    is_active: bool
    mfa_enrolled: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


# ----- Roles & permissions -----


class RoleOut(_ApiModel):
    id: uuid.UUID
    code: str
    name: str
    description: str | None
    is_system: bool


class PermissionOut(_ApiModel):
    id: uuid.UUID
    code: str
    domain: str
    entity: str
    action: str


# ----- Scopes -----


class ScopeAssign(_ApiModel):
    scope_type: ScopeType
    scope_ref_id: uuid.UUID | None = Field(
        default=None,
        description="Required unless scope_type='global'.",
    )


class ScopeOut(_ApiModel):
    id: uuid.UUID
    scope_type: ScopeType
    scope_ref_id: uuid.UUID | None


# ----- Pagination envelope -----

T = TypeVar("T")


class Page(_ApiModel, Generic[T]):
    items: list[T]
    total: int
    page: int = 1
    page_size: int = 50
