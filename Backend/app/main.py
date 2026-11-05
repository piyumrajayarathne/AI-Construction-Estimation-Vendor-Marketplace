from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import engine
from app.models import activity, document, estimation, project, user  # noqa: F401
from app.modules.ai.router import router as ai_router
from app.modules.auth.router import router as auth_router
from app.modules.documents.router import router as documents_router
from app.modules.estimation.router import router as estimation_router
from app.modules.projects.router import router as projects_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    if settings.is_sqlite:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AURABUILD Construction Intelligence",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["http://127.0.0.1:43123"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(documents_router)
app.include_router(estimation_router)
app.include_router(ai_router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "aurabuild"}
