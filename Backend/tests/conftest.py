import os
import tempfile
from collections.abc import Generator
from pathlib import Path

TMP = Path(tempfile.mkdtemp(prefix="aurabuild-test-"))
os.environ["ENVIRONMENT"] = "test"
os.environ["JWT_SECRET"] = "test-jwt-secret-not-for-production"
os.environ["DATABASE_URL"] = f"sqlite:///{TMP / 'test.db'}"
os.environ["UPLOAD_DIR"] = str(TMP / "uploads")
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:43123"
os.environ["LLM_ENABLED"] = "false"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402
from app.main import app  # noqa: E402

get_settings.cache_clear()
Base.metadata.create_all(bind=engine)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client


def auth_header(client: TestClient, email: str, password: str = "password123") -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def register_user(
    client: TestClient,
    email: str,
    role: str = "customer",
    full_name: str = "Test User",
    password: str = "password123",
) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )
    assert response.status_code == 201, response.text
