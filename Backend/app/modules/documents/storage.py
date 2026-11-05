from pathlib import Path

from app.core.config import get_settings


def storage_root() -> Path:
    root = Path(get_settings().upload_dir)
    root.mkdir(parents=True, exist_ok=True)
    return root


def save_bytes(project_id: str, document_id: str, data: bytes) -> str:
    relative = f"{project_id}/{document_id}.pdf"
    path = storage_root() / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return relative


def resolve_key(storage_key: str) -> Path:
    path = (storage_root() / storage_key).resolve()
    root = storage_root().resolve()
    if root not in path.parents and path != root:
        raise ValueError("Invalid storage key")
    return path
