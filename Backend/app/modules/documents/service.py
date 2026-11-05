from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.models.project import Project
from app.modules.documents.parser import extract_page_chunks
from app.modules.documents.storage import resolve_key
from app.modules.projects.service import log_activity


def process_document(db: Session, document_id: str) -> None:
    document = db.get(Document, document_id)
    if document is None:
        return
    document.status = "processing"
    db.commit()
    try:
        path = resolve_key(document.storage_key)
        if not path.exists():
            raise FileNotFoundError("Stored file is not available")
        chunks = extract_page_chunks(path)
        document.chunks.clear()
        db.flush()
        for chunk in chunks:
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=chunk["chunk_index"],
                    content=chunk["content"],
                    extra_metadata=chunk["metadata"],
                    has_embedding=False,
                )
            )
        empty_pages = sum(1 for chunk in chunks if not chunk["content"])
        document.page_count = len(chunks)
        document.status = "processed"
        document.error_message = None
        document.parse_metadata = {
            "page_count": len(chunks),
            "empty_pages": empty_pages,
            "char_count": sum(len(chunk["content"]) for chunk in chunks),
        }
        if empty_pages:
            document.parse_metadata["missing_data"] = [
                f"{empty_pages} page(s) had no extractable text"
            ]
        project = db.get(Project, document.project_id)
        if project and project.status == "draft":
            project.status = "analyzing"
        log_activity(
            db,
            document.project_id,
            "document.processed",
            f"Processed {document.file_name} ({len(chunks)} page chunks)",
        )
        db.commit()
    except Exception as exc:  # noqa: BLE001 — persist failure for the operator
        document.status = "failed"
        document.error_message = "The PDF could not be processed."
        document.parse_metadata = {"error": str(exc)}
        log_activity(
            db,
            document.project_id,
            "document.failed",
            f"Failed to process {document.file_name}",
        )
        db.commit()
