from pathlib import Path

import fitz


def extract_page_chunks(path: Path) -> list[dict]:
    chunks: list[dict] = []
    with fitz.open(path) as pdf:
        for index, page in enumerate(pdf, start=1):
            text = page.get_text("text") or ""
            chunks.append(
                {
                    "chunk_index": index,
                    "content": text.strip(),
                    "metadata": {
                        "page_number": index,
                        "char_count": len(text),
                    },
                }
            )
    return chunks
