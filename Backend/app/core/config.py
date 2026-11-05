from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "local"
    jwt_secret: str = "change-me-in-local-only"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    database_url: str = "sqlite:///./aurabuild.db"
    upload_dir: str = str(Path("./uploads").resolve())
    cors_origins: str = "http://localhost:43123,http://127.0.0.1:43123"
    llm_enabled: bool = False
    openai_api_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
