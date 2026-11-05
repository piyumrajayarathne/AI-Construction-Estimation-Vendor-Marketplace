from datetime import datetime

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: str
    project_id: str
    file_name: str
    file_type: str
    status: str
    uploaded_at: datetime
    document_kind: str | None = None
    verification_status: str | None = None
    page_count: int | None = None
    error: str | None = None
    error_message: str | None = None
    parse_metadata: dict | None = None


class ChunkOut(BaseModel):
    id: str
    chunk_index: int
    content: str
    metadata: dict | None = None
    has_embedding: bool | None = False
