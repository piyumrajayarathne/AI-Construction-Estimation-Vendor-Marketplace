"""
ACEVM-91 - PDF processing.

Runs in the background after an upload (or a reprocess):

    pending -> processing -> processed
                          -> failed   (with a message the user can read)

Steps: find the stored file -> parse it -> chunk it -> replace the old
chunks -> save a summary in parse_metadata -> write to the activity log.
"""

import logging
import time

from sqlalchemy.orm import Session

from app.models.document import Document, DocumentChunk
from app.models.project import Project
from app.modules.documents.chunker import chunk_pages
from app.modules.documents.parser import ParsedPdf, PdfParseError, parse_pdf
from app.modules.documents.storage import resolve_key
from app.modules.projects.service import log_activity

logger = logging.getLogger(__name__)

PARSER_NAME = "pymupdf-v2"  # change this if the parser changes, so we know which version read a document


def _missing_data_notes(parsed: ParsedPdf) -> list[str]:
    """
    Plain notes about what we couldn't read. The estimation side shows these
    so nobody assumes we read the whole document when we didn't.
    """
    notes = []
    if parsed.scanned_pages:
        pages = ", ".join(str(n) for n in parsed.scanned_pages)
        notes.append(f"Page(s) {pages} look scanned (image only). Text was not extracted - OCR is not enabled yet.")

    other_empty = [n for n in parsed.empty_pages if n not in parsed.scanned_pages]
    if other_empty:
        pages = ", ".join(str(n) for n in other_empty)
        notes.append(f"Page(s) {pages} had no extractable text.")
    return notes


def _save_chunks(db: Session, document: Document, chunks: list[dict]) -> None:
    # On a reprocess, delete the old chunks first so we don't end up with duplicates
    document.chunks.clear()
    db.flush()

    for chunk in chunks:
        db.add(
            DocumentChunk(
                document_id=document.id,
                chunk_index=chunk["chunk_index"],
                content=chunk["content"],
                extra_metadata=chunk["metadata"],
                has_embedding=False,  # embeddings are the next step (RAG), not done here
            )
        )


def _mark_failed(db: Session, document: Document, user_message: str, detail: str) -> None:
    db.rollback()  # throw away any half-saved chunks from this run
    document.status = "failed"
    document.error_message = user_message
    # the frontend reads parse_metadata.error, so keep it readable for the user.
    # The technical detail goes to the server log only.
    document.parse_metadata = {"parser": PARSER_NAME, "error": user_message}
    log_activity(db, document.project_id, "document.failed", f"Failed to process {document.file_name}: {user_message}")
    db.commit()
    logger.warning("Document %s failed: %s", document.id, detail)


def process_document(db: Session, document_id: str) -> None:
    document = db.get(Document, document_id)
    if document is None:
        return  # deleted before the background task got to it

    document.status = "processing"
    db.commit()
    started = time.perf_counter()

    try:
        path = resolve_key(document.storage_key)
        if not path.exists():
            raise FileNotFoundError(f"Stored file missing for key {document.storage_key}")

        parsed = parse_pdf(path)
        chunks = chunk_pages(parsed.pages)
        _save_chunks(db, document, chunks)

        notes = _missing_data_notes(parsed)
        document.page_count = parsed.page_count
        document.status = "processed"
        document.error_message = None
        document.parse_metadata = {
            "parser": PARSER_NAME,
            "page_count": parsed.page_count,
            "chunk_count": len(chunks),
            "char_count": sum(len(c["content"]) for c in chunks),
            "table_count": sum(p.table_count for p in parsed.pages),
            "empty_pages": parsed.empty_pages,
            "scanned_pages": parsed.scanned_pages,
            "title": parsed.title,
            "processing_ms": round((time.perf_counter() - started) * 1000),
        }
        if notes:
            document.parse_metadata["missing_data"] = notes

        # first processed document moves the project from draft to analyzing
        project = db.get(Project, document.project_id)
        if project and project.status == "draft":
            project.status = "analyzing"

        log_activity(
            db,
            document.project_id,
            "document.processed",
            f"Processed {document.file_name} ({parsed.page_count} pages, {len(chunks)} chunks)",
        )
        db.commit()

    except PdfParseError as exc:
        # problem with the file itself (password, damaged...). The message is already user friendly.
        _mark_failed(db, document, str(exc), repr(exc.__cause__ or exc))
    except FileNotFoundError as exc:
        _mark_failed(db, document, "The uploaded file could not be found on the server. Please upload it again.", str(exc))
    except Exception as exc:  # noqa: BLE001 - one bad PDF must never crash the worker
        logger.exception("Unexpected error processing document %s", document_id)
        _mark_failed(db, document, "The PDF could not be processed.", repr(exc))
