"""
Writes the sample PDFs to Backend/sample_docs/ so you can upload them in the UI.

Run from the Backend folder:
    python -m scripts.make_sample_pdfs
"""

from pathlib import Path

from tests.sample_documents import SAMPLE_DOCUMENTS


def main() -> None:
    out_dir = Path("sample_docs")
    out_dir.mkdir(exist_ok=True)

    for file_name, (build, kind) in SAMPLE_DOCUMENTS.items():
        (out_dir / file_name).write_bytes(build())
        print(f"wrote {out_dir / file_name}  (upload as: {kind})")


if __name__ == "__main__":
    main()
