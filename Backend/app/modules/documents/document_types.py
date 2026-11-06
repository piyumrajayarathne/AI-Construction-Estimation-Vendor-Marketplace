"""
ACEVM-28 - Document types we accept for a project.

Keep this list in sync with DocumentKind in Frontend/src/types/index.ts.
If you add a new kind here, add it there too, otherwise the upload
dropdown won't show it.
"""

from enum import Enum


class DocumentKind(str, Enum):
    DRAWING = "drawing"
    SPECIFICATION = "specification"
    EXISTING_BOQ = "existing_boq"
    OTHER = "other"


# Short descriptions - handy for the API docs and for anyone new to the project
DOCUMENT_KIND_INFO: dict[str, str] = {
    DocumentKind.DRAWING.value: "Architectural / structural drawings (plans, sections, elevations)",
    DocumentKind.SPECIFICATION.value: "Written specs - materials, finishes, workmanship notes",
    DocumentKind.EXISTING_BOQ.value: "A BOQ the customer already has. Treated as a source document, not our output",
    DocumentKind.OTHER.value: "Anything else related to the project",
}

ALLOWED_KINDS: set[str] = {kind.value for kind in DocumentKind}

# Only PDFs for now. Excel/CSV and images come later in the plan.
ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf", "application/octet-stream"}

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB


def normalize_kind(raw: str | None) -> str | None:
    """Return a clean kind like 'drawing', or None if it isn't one we know."""
    kind = (raw or DocumentKind.OTHER.value).strip().lower()
    # people type "existing boq" or "existing-boq" in tools like Postman
    kind = kind.replace(" ", "_").replace("-", "_")
    return kind if kind in ALLOWED_KINDS else None
