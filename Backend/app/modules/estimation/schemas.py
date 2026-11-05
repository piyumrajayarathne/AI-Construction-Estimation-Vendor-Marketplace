from datetime import datetime

from pydantic import BaseModel, Field


class EstimationLine(BaseModel):
    description: str
    unit: str | None = None
    quantity: float | None = None
    rate: float | None = None
    amount: float | None = None


class EstimationOut(BaseModel):
    status: str
    engine: str | None = "stub"
    reason: str | None = None
    lines: list[EstimationLine] = Field(default_factory=list)
    missing_data: list[str] = Field(default_factory=list)
    verification_status: str | None = "unverified"
    requested_at: datetime | None = None
