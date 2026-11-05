from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.modules.projects.schemas import (
    ActivityOut,
    ProjectCreate,
    ProjectOut,
    ProjectPatch,
)
from app.modules.projects.service import (
    ALLOWED_STATUS,
    get_owned_project,
    list_owned_projects,
    log_activity,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _project_out(project: Project) -> ProjectOut:
    return ProjectOut(
        id=project.id,
        name=project.name,
        description=project.description,
        location=project.location,
        budget_cap=project.budget_cap,
        status=project.status,
        owner_id=project.owner_id,
        created_at=project.created_at,
        updated_at=project.updated_at,
        document_count=len(project.documents) if project.documents is not None else 0,
    )


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProjectOut:
    project = Project(
        owner_id=user.id,
        name=payload.name.strip(),
        description=(payload.description or "").strip() or None,
        location=(payload.location or "").strip() or None,
        budget_cap=payload.budget_cap,
        status="draft",
    )
    db.add(project)
    db.flush()
    log_activity(db, project.id, "project.created", f"Created project {project.name}", user.email)
    db.commit()
    db.refresh(project)
    return _project_out(project)


@router.get("", response_model=list[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ProjectOut]:
    return [_project_out(project) for project in list_owned_projects(db, user)]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProjectOut:
    return _project_out(get_owned_project(db, project_id, user))


@router.patch("/{project_id}", response_model=ProjectOut)
def patch_project(
    project_id: str,
    payload: ProjectPatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ProjectOut:
    project = get_owned_project(db, project_id, user)
    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] is not None:
        if data["status"] not in ALLOWED_STATUS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid project status",
            )
        if data["status"] == "estimated":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot mark a project estimated without a connected estimation engine.",
            )
    for key, value in data.items():
        setattr(project, key, value.strip() if isinstance(value, str) else value)
    project.updated_at = datetime.now(timezone.utc)
    log_activity(db, project.id, "project.updated", f"Updated project {project.name}", user.email)
    db.commit()
    db.refresh(project)
    return _project_out(project)


@router.get("/{project_id}/activity", response_model=list[ActivityOut])
def list_activity(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ActivityOut]:
    project = get_owned_project(db, project_id, user)
    events = sorted(project.activity, key=lambda item: item.created_at, reverse=True)
    return [
        ActivityOut(
            id=event.id,
            project_id=event.project_id,
            event_type=event.event_type,
            message=event.message,
            created_at=event.created_at,
            actor_email=event.actor_email,
            metadata=event.extra_metadata,
        )
        for event in events
    ]
