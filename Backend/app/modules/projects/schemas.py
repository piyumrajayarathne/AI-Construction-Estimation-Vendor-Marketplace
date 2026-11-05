from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    location: str | None = None
    budget_cap: float | None = None


class ProjectPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    location: str | None = None
    budget_cap: float | None = None
    status: str | None = None


class ProjectOut(BaseModel):
    id: str
    name: str
    description: str | None
    location: str | None
    budget_cap: float | None
    status: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    document_count: int | None = None

    model_config = {"from_attributes": True}


class ActivityOut(BaseModel):
    id: str
    project_id: str
    event_type: str
    message: str
    created_at: datetime
    actor_email: str | None = None
    metadata: dict | None = None

    model_config = {"from_attributes": True}
