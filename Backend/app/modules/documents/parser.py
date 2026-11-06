"""
ACEVM-57 - PDF parser.

Takes a PDF and gives back one ParsedPage per page: the text in reading
order, any tables turned into "a | b | c" rows, and some flags (empty
page, looks scanned) that the processing step uses to report missing data.

This file only reads PDFs. It doesn't touch the database. That keeps it
easy to test and lets the agent/RAG side reuse it later.
"""

from dataclasses import dataclass, field
from pathlib import Path

import fitz  # PyMuPDF


class PdfParseError(Exception):
    """Something is wrong with the PDF itself. The message is safe to show to the user."""


@dataclass
class ParsedPage:
    page_number: int  # starts at 1, same as what people see in a PDF viewer
    text: str
    table_count: int = 0
    image_count: int = 0
    is_empty: bool = False
    likely_scanned: bool = False


@dataclass
class ParsedPdf:
    pages: list[ParsedPage] = field(default_factory=list)
    title: str | None = None

    @property
    def page_count(self) -> int:
        return len(self.pages)

    @property
    def empty_pages(self) -> list[int]:
        return [p.page_number for p in self.pages if p.is_empty]

    @property
    def scanned_pages(self) -> list[int]:
        return [p.page_number for p in self.pages if p.likely_scanned]


def _open_pdf(path: Path) -> fitz.Document:
    try:
        pdf = fitz.open(path)
    except Exception as exc:  # PyMuPDF raises different errors for different kinds of broken files
        raise PdfParseError("The file is damaged or is not a valid PDF.") from exc

    if pdf.needs_pass:
        pdf.close()
        raise PdfParseError("The PDF is password protected. Please upload an unlocked copy.")
    if pdf.page_count == 0:
        pdf.close()
        raise PdfParseError("The PDF has no pages.")
    return pdf


def _table_to_text(table) -> str:
    """Turn one detected table into lines like 'Item | Description | Unit | Qty'."""
    lines = []
    for row in table.extract():
        cells = [" ".join(str(cell).split()) for cell in row if cell not in (None, "")]
        if cells:
            lines.append(" | ".join(cells))
    return "\n".join(lines)


def _find_tables(page: fitz.Page) -> list:
    # find_tables() can fail on unusual drawings. Missing a table is better
    # than failing the whole document, so we just carry on without tables.
    try:
        return list(page.find_tables().tables)
    except Exception:
        return []


def _parse_page(page: fitz.Page, page_number: int) -> ParsedPage:
    tables = _find_tables(page)
    table_rects = [fitz.Rect(t.bbox) for t in tables]

    parts: list[str] = []

    # "blocks" gives us paragraphs with positions. sort=True puts them in
    # reading order (top to bottom, then left to right). Plain get_text()
    # often mixes up the order on drawings.
    for x0, y0, x1, y1, text, _block_no, block_type in page.get_text("blocks", sort=True):
        if block_type != 0:  # 1 = image block, we only want text
            continue
        # skip text that sits inside a table, it gets added once below as clean rows
        if any(fitz.Rect(x0, y0, x1, y1).intersects(rect) for rect in table_rects):
            continue
        cleaned = text.strip()
        if cleaned:
            parts.append(cleaned)

    for number, table in enumerate(tables, start=1):
        table_text = _table_to_text(table)
        if table_text:
            parts.append(f"[Table {number}]\n{table_text}")

    text = "\n\n".join(parts)
    image_count = len(page.get_images(full=False))
    is_empty = not text.strip()

    return ParsedPage(
        page_number=page_number,
        text=text,
        table_count=len(tables),
        image_count=image_count,
        is_empty=is_empty,
        # no text but there is an image -> most likely a scanned sheet (we don't do OCR yet)
        likely_scanned=is_empty and image_count > 0,
    )


def parse_pdf(path: Path) -> ParsedPdf:
    """Read every page of the PDF at `path`. Raises PdfParseError if it can't be opened."""
    pdf = _open_pdf(path)
    try:
        result = ParsedPdf(title=(pdf.metadata or {}).get("title") or None)
        for index, page in enumerate(pdf, start=1):
            result.pages.append(_parse_page(page, index))
        return result
    finally:
        pdf.close()


def extract_page_chunks(path: Path) -> list[dict]:
    """
    Kept so older code calling this name still works (one chunk per page).
    New code should use parse_pdf() + chunker.chunk_pages().
    """
    return [
        {
            "chunk_index": page.page_number,
            "content": page.text,
            "metadata": {"page_number": page.page_number, "char_count": len(page.text)},
        }
        for page in parse_pdf(path).pages
    ]
