"""Planning business logic — AWP lifecycle state machine."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError, ValidationFailure
from app.modules.planning.models import AnnualWorkPlan, AwpActivity
from app.modules.planning.repository import AwpActivityRepository, AwpRepository
from app.modules.planning.schemas import AwpActivityCreate, AwpCreate

# Allowed transitions in the AWP state machine
_AWP_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted"},
    "submitted": {"under_review", "revisions_requested"},
    "under_review": {"approved", "revisions_requested"},
    "revisions_requested": {"draft"},
    "approved": {"active"},
    "active": {"closed"},
    "closed": set(),
}


class PlanningService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.awps = AwpRepository(session)
        self.activities = AwpActivityRepository(session)

    # ----- AWP lifecycle -----

    async def create_awp(self, payload: AwpCreate) -> AnnualWorkPlan:
        existing = await self.awps.get_for_fy_directorate(
            payload.fiscal_year_id, payload.directorate_id
        )
        if existing:
            raise ConflictError(
                "An AWP already exists for this fiscal year and directorate.",
                {
                    "fiscal_year_id": str(payload.fiscal_year_id),
                    "directorate_id": str(payload.directorate_id),
                },
            )
        awp = AnnualWorkPlan(
            fiscal_year_id=payload.fiscal_year_id,
            directorate_id=payload.directorate_id,
            currency_code=payload.currency_code,
            status="draft",
        )
        return await self.awps.create(awp)

    async def get_awp(self, awp_id: uuid.UUID) -> AnnualWorkPlan:
        awp = await self.awps.get(awp_id)
        if not awp:
            raise NotFoundError(f"AWP {awp_id} not found.", {"id": str(awp_id)})
        return awp

    async def transition_awp(
        self, awp_id: uuid.UUID, *, to: str, actor: uuid.UUID
    ) -> AnnualWorkPlan:
        awp = await self.get_awp(awp_id)
        if to not in _AWP_TRANSITIONS.get(awp.status, set()):
            raise ValidationFailure(
                f"Illegal AWP transition: {awp.status} -> {to}",
                {"from": awp.status, "to": to},
            )
        awp.status = to
        now = datetime.now(UTC)
        if to == "submitted":
            awp.submitted_at = now
        elif to == "approved":
            awp.approved_at = now
            awp.approved_by = actor
        await self.session.flush()
        return awp

    # ----- Activities -----

    async def add_activity(
        self, awp_id: uuid.UUID, payload: AwpActivityCreate
    ) -> AwpActivity:
        awp = await self.get_awp(awp_id)
        if awp.status not in {"draft", "revisions_requested"}:
            raise ValidationFailure(
                f"Cannot add activities to an AWP in status '{awp.status}'.",
                {"awp_status": awp.status},
            )
        activity = AwpActivity(
            awp_id=awp_id,
            objective_id=payload.objective_id,
            programme_id=payload.programme_id,
            code=payload.code,
            title=payload.title,
            description=payload.description,
            owner_org_id=payload.owner_org_id,
            executor_org_id=payload.executor_org_id,
            executor_org_type=payload.executor_org_type,
            starts_on=payload.starts_on,
            ends_on=payload.ends_on,
            expected_output=payload.expected_output,
            status="planned",
        )
        return await self.activities.create(activity)
