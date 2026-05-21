"""MDM HTTP routes (MVP read-only surface)."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.deps import DbSession
from app.core.security import require
from app.modules.mdm.models import Currency, FiscalYear, IndicatorDefinition

router = APIRouter()


@router.get(
    "/fiscal-years",
    dependencies=[Depends(require("mdm.read"))],
    summary="List fiscal years",
)
async def list_fiscal_years(session: DbSession) -> list[dict]:
    rows = (await session.scalars(select(FiscalYear).order_by(FiscalYear.starts_on.desc()))).all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "starts_on": r.starts_on.isoformat(),
            "ends_on": r.ends_on.isoformat(),
            "is_active": r.is_active,
        }
        for r in rows
    ]


@router.get(
    "/currencies",
    dependencies=[Depends(require("mdm.read"))],
    summary="List currencies",
)
async def list_currencies(session: DbSession) -> list[dict]:
    rows = (await session.scalars(select(Currency).order_by(Currency.code))).all()
    return [{"code": r.code, "name": r.name, "minor_unit": r.minor_unit} for r in rows]


@router.get(
    "/indicators",
    dependencies=[Depends(require("mdm.read"))],
    summary="List indicator definitions",
)
async def list_indicator_definitions(session: DbSession) -> list[dict]:
    rows = (
        await session.scalars(
            select(IndicatorDefinition)
            .where(IndicatorDefinition.is_active.is_(True))
            .order_by(IndicatorDefinition.code)
        )
    ).all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "name_en": r.name_en,
            "data_type": r.data_type,
            "unit": r.unit,
            "direction": r.direction,
        }
        for r in rows
    ]
