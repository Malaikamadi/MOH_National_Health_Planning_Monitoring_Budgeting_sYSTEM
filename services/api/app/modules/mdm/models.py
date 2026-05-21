"""MDM ORM models — fiscal years, currencies, indicator definitions."""

from __future__ import annotations

from datetime import date

from sqlalchemy import ARRAY, Boolean, CheckConstraint, Date, Integer, SmallInteger, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base, IdMixin, Timestamped, Versioned

SCHEMA = "mdm"


class FiscalYear(Base, IdMixin):
    __tablename__ = "fiscal_years"
    __table_args__ = (
        CheckConstraint("ends_on > starts_on", name="fy_dates_valid"),
        {"schema": SCHEMA},
    )

    code: Mapped[str] = mapped_column(String(16), unique=True, nullable=False)
    starts_on: Mapped[date] = mapped_column(Date, nullable=False)
    ends_on: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"))


class Currency(Base):
    __tablename__ = "currencies"
    __table_args__ = {"schema": SCHEMA}

    code: Mapped[str] = mapped_column(String(3), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    minor_unit: Mapped[int] = mapped_column(SmallInteger, default=2, server_default="2")


class IndicatorDefinition(Base, IdMixin, Timestamped, Versioned):
    __tablename__ = "indicator_definitions"
    __table_args__ = (
        CheckConstraint(
            "data_type IN ('integer','decimal','percentage','rate','count','ratio','text','boolean')",
            name="indicator_data_type_valid",
        ),
        CheckConstraint(
            "direction IN ('higher_better','lower_better','target_based')",
            name="indicator_direction_valid",
        ),
        {"schema": SCHEMA},
    )

    code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_kri: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    data_type: Mapped[str] = mapped_column(String(32), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(32))
    direction: Mapped[str] = mapped_column(String(32), nullable=False)
    default_disaggregation: Mapped[list[str] | None] = mapped_column(ARRAY(String))
    fhir_code: Mapped[str | None] = mapped_column(String(128))
    dhis2_uid: Mapped[str | None] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default=text("true"))
