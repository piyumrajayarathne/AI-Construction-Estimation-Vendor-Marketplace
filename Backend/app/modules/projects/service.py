from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity import ActivityEvent
from app.models.project import Project
from app.models.user import User

ALLOWED_STATUS = {"draft", "analyzing", "estimated", "sourcing", "quoted", "closed"}


def log_activity(
    db: Session,
    project_id: str,
    event_type: str,
    message: str,
    actor_email: str | None = None,
    metadata: dict | None = None,
) -> None:
    db.add(
        ActivityEvent(
            project_id=project_id,
            event_type=event_type,
            message=message,
            actor_email=actor_email,
            extra_metadata=metadata,
        )
    )


def get_owned_project(db: Session, project_id: str, user: User) -> Project:
    project = db.get(Project, project_id)
    if project is None or project.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def list_owned_projects(db: Session, user: User) -> list[Project]:
    return list(
        db.scalars(
            select(Project).where(Project.owner_id == user.id).order_by(Project.updated_at.desc())
        ).all()
    )
