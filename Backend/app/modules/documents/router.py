from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.modules.documents.schemas import ChunkOut, DocumentOut
from app.modules.documents.service import process_document
from app.modules.documents.storage import save_bytes
from app.modules.projects.service import get_owned_project, log_activity

router = APIRouter(prefix="/api/projects/{project_id}/documents", tags=["documents"])

MAX_BYTES = 25 * 1024 * 1024
ALLOWED_KINDS = {"drawing", "specification", "existing_boq", "other"}


def _document_out(doc: Document) -> DocumentOut:
    return DocumentOut(
        id=doc.id,
        project_id=doc.project_id,
        file_name=doc.file_name,
        file_type=doc.file_type,
        status=doc.status,
        uploaded_at=doc.uploaded_at,
        document_kind=doc.document_kind,
        verification_status=doc.verification_status,
        page_count=doc.page_count,
        error=doc.error_message,
        error_message=doc.error_message,
        parse_metadata=doc.parse_metadata,
    )


def _run_processing(document_id: str) -> None:
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        process_document(db, document_id)
    finally:
        db.close()


@router.post("", response_model=DocumentOut, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    project_id: str,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    document_kind: str = Form("other"),
) -> DocumentOut:
    project = get_owned_project(db, project_id, user)
    kind = (document_kind or "other").strip().lower()
    if kind not in ALLOWED_KINDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="document_kind must be drawing, specification, existing_boq, or other",
        )
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 25 MB")
    if not data.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted (drawings, specifications, existing BOQs).",
        )
    document = Document(
        project_id=project.id,
        file_name=file.filename or "upload.pdf",
        file_type=file.content_type or "application/pdf",
        document_kind=kind,
        status="pending",
        verification_status="unverified",
        storage_key="pending",
    )
    db.add(document)
    db.flush()
    document.storage_key = save_bytes(project.id, document.id, data)
    log_activity(
        db,
        project.id,
        "document.uploaded",
        f"Uploaded {document.file_name} as {kind}",
        user.email,
        {"document_kind": kind},
    )
    db.commit()
    db.refresh(document)
    background.add_task(_run_processing, document.id)
    return _document_out(document)


@router.get("", response_model=list[DocumentOut])
def list_documents(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[DocumentOut]:
    project = get_owned_project(db, project_id, user)
    docs = sorted(project.documents, key=lambda item: item.uploaded_at, reverse=True)
    return [_document_out(doc) for doc in docs]


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    project_id: str,
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DocumentOut:
    project = get_owned_project(db, project_id, user)
    document = db.get(Document, doc_id)
    if document is None or document.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return _document_out(document)


@router.get("/{doc_id}/chunks", response_model=list[ChunkOut])
def get_chunks(
    project_id: str,
    doc_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ChunkOut]:
    project = get_owned_project(db, project_id, user)
    document = db.get(Document, doc_id)
    if document is None or document.project_id != project.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    chunks = sorted(document.chunks, key=lambda item: item.chunk_index)
    return [
        ChunkOut(
            id=chunk.id,
            chunk_index=chunk.chunk_index,
            content=chunk.content,
            metadata=chunk.extra_metadata,
            has_embedding=chunk.has_embedding,
        )
        for chunk in chunks
    ]
