"""Org Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FacilityType = Literal[
    "CHP", "CHC", "MCHP", "hospital_district", "hospital_referral", "hospital_specialised", "other"
]
Ownership = Literal["public", "mission", "private", "ngo"]


class _ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True, str_strip_whitespace=True)


# ----- Directorates -----


class DirectorateCreate(_ApiModel):
    code: str = Field(min_length=2, max_length=32)
    name: str = Field(min_length=2, max_length=255)
    parent_id: uuid.UUID | None = None
    head_user_id: uuid.UUID | None = None
    valid_from: date


class DirectorateUpdate(_ApiModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    parent_id: uuid.UUID | None = None
    head_user_id: uuid.UUID | None = None
    is_active: bool | None = None
    valid_to: date | None = None


class DirectorateOut(_ApiModel):
    id: uuid.UUID
    code: str
    name: str
    parent_id: uuid.UUID | None
    head_user_id: uuid.UUID | None
    is_active: bool
    valid_from: date
    valid_to: date | None
    created_at: datetime
    updated_at: datetime


# ----- Programmes -----


class ProgrammeCreate(_ApiModel):
    code: str = Field(min_length=2, max_length=32)
    name: str = Field(min_length=2, max_length=255)
    directorate_id: uuid.UUID
    manager_user_id: uuid.UUID | None = None
    description: str | None = None


class ProgrammeOut(_ApiModel):
    id: uuid.UUID
    code: str
    name: str
    directorate_id: uuid.UUID
    manager_user_id: uuid.UUID | None
    description: str | None


# ----- Districts -----


class DistrictOut(_ApiModel):
    id: uuid.UUID
    code: str
    name: str
    region: str
    population: int | None
    valid_from: date
    valid_to: date | None


# ----- Facilities -----


class FacilityOut(_ApiModel):
    id: uuid.UUID
    code: str
    name: str
    facility_type: FacilityType
    ownership: Ownership
    district_id: uuid.UUID
    chiefdom_id: uuid.UUID | None
    is_operational: bool
    dhis2_uid: str | None
