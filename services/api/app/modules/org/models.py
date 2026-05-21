"""Org ORM models — mirrors ``docs/03-database-schema.md §2``."""

from __future__ import annotations

import uuid
from datetime import date

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base, IdMixin, Timestamped, Versioned

SCHEMA = "org"


class Directorate(Base, IdMixin, Timestamped, Versioned):
    __tablename__ = "directorates"
    __table_args__ = {"schema": SCHEMA}

    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.directorates.id")
    )
    head_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[date | None] = mapped_column(Date)

    parent: Mapped["Directorate | None"] = relationship(
        remote_side="Directorate.id", back_populates="children"
    )
    children: Mapped[list["Directorate"]] = relationship(back_populates="parent")
    programmes: Mapped[list["Programme"]] = relationship(back_populates="directorate")


class Programme(Base, IdMixin, Timestamped, Versioned):
    __tablename__ = "programmes"
    __table_args__ = {"schema": SCHEMA}

    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    directorate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.directorates.id"), nullable=False
    )
    manager_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    description: Mapped[str | None] = mapped_column(Text)

    directorate: Mapped["Directorate"] = relationship(back_populates="programmes")


class District(Base, IdMixin, Timestamped):
    __tablename__ = "districts"
    __table_args__ = (
        Index("ix_districts_geom", "geometry", postgresql_using="gist"),
        {"schema": SCHEMA},
    )

    code: Mapped[str] = mapped_column(String(16), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    region: Mapped[str] = mapped_column(String(64), nullable=False)
    geometry: Mapped[object | None] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=False)
    )
    population: Mapped[int | None] = mapped_column(Integer)
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[date | None] = mapped_column(Date)


class Chiefdom(Base, IdMixin, Timestamped):
    __tablename__ = "chiefdoms"
    __table_args__ = {"schema": SCHEMA}

    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    district_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.districts.id"), nullable=False
    )
    geometry: Mapped[object | None] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326)
    )


class Facility(Base, IdMixin, Timestamped):
    __tablename__ = "facilities"
    __table_args__ = (
        Index("ix_facilities_district", "district_id"),
        Index("ix_facilities_location", "location", postgresql_using="gist"),
        Index(
            "ix_facilities_name_trgm",
            "name",
            postgresql_using="gin",
            postgresql_ops={"name": "gin_trgm_ops"},
        ),
        {"schema": SCHEMA},
    )

    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    facility_type: Mapped[str] = mapped_column(String(64), nullable=False)
    ownership: Mapped[str] = mapped_column(String(32), nullable=False)
    chiefdom_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.chiefdoms.id")
    )
    district_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey(f"{SCHEMA}.districts.id"), nullable=False
    )
    location: Mapped[object | None] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False)
    )
    catchment: Mapped[object | None] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326)
    )
    in_charge_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("iam.users.id")
    )
    is_operational: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true")
    )
    dhis2_uid: Mapped[str | None] = mapped_column(String(64))
