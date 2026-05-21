"""Planning Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

AwpStatus = Literal[
    "draft", "submitted", "under_review", "revisions_requested", "approved", "active", "closed"
]
ActivityStatus = Literal["planned", "in_progress", "delayed", "completed", "cancelled"]
ExecutorOrgType = Literal["directorate", "programme", "district", "facility"]


class _ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, str_strip_whitespace=True)


# ----- AWP -----


class AwpCreate(_ApiModel):
    fiscal_year_id: uuid.UUID
    directorate_id: uuid.UUID
    currency_code: str = Field(default="SLE", min_length=3, max_length=3)


class AwpOut(_ApiModel):
    id: uuid.UUID
    fiscal_year_id: uuid.UUID
    directorate_id: uuid.UUID
    status: AwpStatus
    submitted_at: datetime | None
    approved_at: datetime | None
    approved_by: uuid.UUID | None
    total_budget: Decimal | None
    currency_code: str
    created_at: datetime
    updated_at: datetime
    version: int


# ----- Activities -----


class AwpActivityCreate(_ApiModel):
    objective_id: uuid.UUID
    programme_id: uuid.UUID | None = None
    code: str = Field(min_length=1, max_length=32)
    title: str = Field(min_length=2, max_length=512)
    description: str | None = None
    owner_org_id: uuid.UUID
    executor_org_id: uuid.UUID | None = None
    executor_org_type: ExecutorOrgType | None = None
    starts_on: date
    ends_on: date
    expected_output: str | None = None

    @model_validator(mode="after")
    def _period_valid(self) -> "AwpActivityCreate":
        if self.ends_on < self.starts_on:
            raise ValueError("ends_on must be on or after starts_on")
        if (self.executor_org_id is None) ^ (self.executor_org_type is None):
            raise ValueError("executor_org_id and executor_org_type must be provided together")
        return self


class AwpActivityOut(_ApiModel):
    id: uuid.UUID
    awp_id: uuid.UUID
    objective_id: uuid.UUID
    programme_id: uuid.UUID | None
    code: str
    title: str
    description: str | None
    owner_org_id: uuid.UUID
    executor_org_id: uuid.UUID | None
    executor_org_type: ExecutorOrgType | None
    starts_on: date
    ends_on: date
    expected_output: str | None
    status: ActivityStatus
    progress_pct: int | None
