from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import get_settings

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AiStatusOut(BaseModel):
    connected: bool
    provider: str | None = None
    message: str


@router.get("/status", response_model=AiStatusOut)
def ai_status() -> AiStatusOut:
    settings = get_settings()
    connected = bool(settings.llm_enabled and settings.openai_api_key)
    if connected:
        return AiStatusOut(
            connected=True,
            provider="openai",
            message="A language model is configured. It must not invent quantities or rates.",
        )
    return AiStatusOut(
        connected=False,
        provider=None,
        message=(
            "No language model is configured. The assistant is not connected and "
            "will not invent masonry quantities, rates, or BOQ lines."
        ),
    )
