"""
ACEVM-82 - Upload checks.

Everything we check before saving a file. Each check raises an
HTTPException with a message the frontend can show as it is.
"""

import re
from pathlib import PurePath

from fastapi import HTTPException, UploadFile, status

from app.modules.documents.document_types import (
    ALLOWED_CONTENT_TYPES,
    ALLOWED_EXTENSIONS,
    MAX_UPLOAD_BYTES,
    normalize_kind,
)


def _bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def clean_file_name(raw_name: str | None) -> str:
    """
    Keep only the file name. Some browsers send a full path like C:\\Users\\..\\plan.pdf.
    We also swap odd characters for '_' so the name displays cleanly.
    """
    name = PurePath((raw_name or "").replace("\\", "/")).name.strip()
    name = re.sub(r"[^\w.\- ()]", "_", name)
    if not name:
        name = "upload.pdf"
    return name[:255]


def validate_kind(raw_kind: str | None) -> str:
    kind = normalize_kind(raw_kind)
    if kind is None:
        raise _bad_request("document_kind must be drawing, specification, existing_boq, or other")
    return kind


async def read_and_validate_pdf(file: UploadFile) -> tuple[str, bytes]:
    """Return (clean file name, file bytes) or raise a 400 / 413."""
    file_name = clean_file_name(file.filename)

    if PurePath(file_name).suffix.lower() not in ALLOWED_EXTENSIONS:
        raise _bad_request("Only PDF files are accepted (drawings, specifications, existing BOQs).")

    if file.content_type and file.content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise _bad_request("Only PDF files are accepted (drawings, specifications, existing BOQs).")

    # Read one byte over the limit. That way we know the file is too big
    # without loading a huge file into memory.
    data = await file.read(MAX_UPLOAD_BYTES + 1)

    if not data:
        raise _bad_request("The uploaded file is empty.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 25 MB",
        )

    # The extension can be faked, so also check the first bytes. Real PDFs start with %PDF.
    if not data.startswith(b"%PDF"):
        raise _bad_request("Only PDF files are accepted (drawings, specifications, existing BOQs).")

    return file_name, data
