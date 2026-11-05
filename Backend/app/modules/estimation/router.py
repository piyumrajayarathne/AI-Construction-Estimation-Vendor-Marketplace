from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.estimation import EstimationRecord
from app.models.user import User
from app.modules.estimation.schemas import EstimationOut
from app.modules.projects.service import get_owned_project, log_activity

router = APIRouter(prefix="/api/projects/{project_id}/estimation", tags=["estimation"])

UNAVAILABLE_REASON = (
    "Masonry estimation engine is not connected. AURABUILD will not fabricate "
    "quantities, rates, CIDA, or BSR numbers."
)
MISSING = [
    "takeoff_engine",
    "verified_rate_library",
    "human_reviewer",
]


def _record_out(record: EstimationRecord | None) -> EstimationOut:
    if record is None:
        return EstimationOut(
            status="unavailable",
            engine="stub",
            reason=UNAVAILABLE_REASON,
            lines=[],
            missing_data=MISSING,
            verification_status="unverified",
            requested_at=None,
        )
    return EstimationOut(
        status=record.status,
        engine=record.engine,
        reason=record.reason,
        lines=[],
        missing_data=record.missing_data or MISSING,
        verification_status=record.verification_status,
        requested_at=record.requested_at,
    )


@router.get("", response_model=EstimationOut)
def get_estimation(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> EstimationOut:
    project = get_owned_project(db, project_id, user)
    return _record_out(project.estimation)


@router.post("", response_model=EstimationOut)
def request_estimation(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> EstimationOut:
    project = get_owned_project(db, project_id, user)
    record = project.estimation
    if record is None:
        record = EstimationRecord(
            project_id=project.id,
            status="pending",
            engine="stub",
            reason=UNAVAILABLE_REASON,
            lines=[],
            missing_data=MISSING,
            verification_status="unverified",
            requested_at=datetime.now(timezone.utc),
        )
        db.add(record)
    else:
        record.status = "pending"
        record.engine = "stub"
        record.reason = UNAVAILABLE_REASON
        record.lines = []
        record.missing_data = MISSING
        record.verification_status = "unverified"
        record.requested_at = datetime.now(timezone.utc)
    log_activity(
        db,
        project.id,
        "estimation.requested",
        "Masonry estimation requested; engine unavailable, no lines generated.",
        user.email,
    )
    db.commit()
    db.refresh(record)
    return _record_out(record)
