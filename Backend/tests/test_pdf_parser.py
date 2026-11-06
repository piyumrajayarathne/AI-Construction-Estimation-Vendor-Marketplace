"""Unit tests for the parser and chunker. No API or database needed."""

from pathlib import Path

import pytest

from app.modules.documents.chunker import chunk_pages
from app.modules.documents.document_types import normalize_kind
from app.modules.documents.parser import ParsedPage, PdfParseError, parse_pdf
from app.modules.documents.validation import clean_file_name
from tests import sample_documents as samples


def _write(tmp_path: Path, data: bytes, name: str = "doc.pdf") -> Path:
    path = tmp_path / name
    path.write_bytes(data)
    return path


def test_drawing_text_is_extracted(tmp_path: Path) -> None:
    parsed = parse_pdf(_write(tmp_path, samples.drawing_pdf()))
    assert parsed.page_count == 1
    text = parsed.pages[0].text
    assert "GROUND FLOOR PLAN" in text
    assert "230mm brick wall" in text


def test_boq_table_rows_are_kept_together(tmp_path: Path) -> None:
    parsed = parse_pdf(_write(tmp_path, samples.boq_pdf()))
    page = parsed.pages[0]
    assert page.table_count >= 1
    # each BOQ line should stay on one row, which is what we need later for quantities
    assert "230mm brick wall | m2 | 120" in page.text


def test_scanned_page_is_flagged(tmp_path: Path) -> None:
    parsed = parse_pdf(_write(tmp_path, samples.scanned_pdf()))
    assert parsed.page_count == 2
    assert parsed.scanned_pages == [2]
    assert parsed.pages[0].is_empty is False


def test_encrypted_pdf_gives_clear_error(tmp_path: Path) -> None:
    with pytest.raises(PdfParseError, match="password"):
        parse_pdf(_write(tmp_path, samples.encrypted_pdf()))


def test_broken_pdf_gives_clear_error(tmp_path: Path) -> None:
    with pytest.raises(PdfParseError):
        parse_pdf(_write(tmp_path, b"%PDF-1.7 this is not really a pdf"))


def test_long_page_is_split_but_keeps_page_number(tmp_path: Path) -> None:
    parsed = parse_pdf(_write(tmp_path, samples.specification_pdf()))
    chunks = chunk_pages(parsed.pages, max_chars=800, overlap=100)

    page_two = [c for c in chunks if c["metadata"]["page_number"] == 2]
    assert len(page_two) > 1, "long page should be split into more than one chunk"
    assert all(len(c["content"]) <= 800 for c in chunks)
    # chunk numbers go 1, 2, 3... with no gaps
    assert [c["chunk_index"] for c in chunks] == list(range(1, len(chunks) + 1))


def test_empty_pages_do_not_create_chunks() -> None:
    pages = [
        ParsedPage(page_number=1, text="Some text"),
        ParsedPage(page_number=2, text="", is_empty=True),
    ]
    chunks = chunk_pages(pages)
    assert len(chunks) == 1
    assert chunks[0]["metadata"]["page_number"] == 1


def test_kind_and_file_name_helpers() -> None:
    assert normalize_kind("Existing BOQ") == "existing_boq"
    assert normalize_kind(None) == "other"
    assert normalize_kind("invoice") is None
    assert clean_file_name("C:\\Users\\me\\Desktop\\plan A.pdf") == "plan A.pdf"
    assert clean_file_name("") == "upload.pdf"
