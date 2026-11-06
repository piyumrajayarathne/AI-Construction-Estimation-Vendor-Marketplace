"""
Splits parsed pages into chunks for search (RAG) and for the document view.

How it works:
  - A chunk never crosses a page, so every chunk can point to "page N" as its source.
  - A short page becomes one chunk.
  - A long page is cut at paragraph breaks into pieces of about MAX_CHARS,
    with a small overlap so a sentence at the cut isn't lost from both sides.

~2800 characters is roughly 500-800 tokens, the size given in the RAG design doc.
"""

from app.modules.documents.parser import ParsedPage

MAX_CHARS = 2800
OVERLAP_CHARS = 200


def _split_long_text(text: str, max_chars: int, overlap: int) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    pieces: list[str] = []
    current = ""

    for para in paragraphs:
        # one huge paragraph with no breaks (it happens with some exported PDFs):
        # cut it into fixed-size slices
        while len(para) > max_chars:
            if current:
                pieces.append(current)
                current = ""
            pieces.append(para[:max_chars])
            para = para[max_chars - overlap:]

        candidate = f"{current}\n\n{para}" if current else para
        if len(candidate) <= max_chars:
            current = candidate
        else:
            pieces.append(current)
            # start the next piece with the end of the previous one (the overlap)
            # (only if it still fits, otherwise just start fresh)
            tail = current[-overlap:] if overlap else ""
            if tail and len(tail) + 2 + len(para) <= max_chars:
                current = f"{tail}\n\n{para}"
            else:
                current = para

    if current:
        pieces.append(current)
    return pieces


def chunk_pages(
    pages: list[ParsedPage],
    max_chars: int = MAX_CHARS,
    overlap: int = OVERLAP_CHARS,
) -> list[dict]:
    """
    Returns a list of dicts ready to save as DocumentChunk rows:
        {"chunk_index": 1, "content": "...", "metadata": {"page_number": 1, ...}}
    Empty pages don't get a chunk. They are reported in parse_metadata instead.
    """
    chunks: list[dict] = []
    index = 1  # the UI shows "Chunk 1, Chunk 2..." so we start at 1

    for page in pages:
        if page.is_empty:
            continue

        pieces = _split_long_text(page.text, max_chars, overlap)
        for part, piece in enumerate(pieces, start=1):
            chunks.append(
                {
                    "chunk_index": index,
                    "content": piece,
                    "metadata": {
                        "page_number": page.page_number,
                        "part": part,
                        "parts_on_page": len(pieces),
                        "char_count": len(piece),
                        "has_table": "[Table " in piece,
                    },
                }
            )
            index += 1

    return chunks
