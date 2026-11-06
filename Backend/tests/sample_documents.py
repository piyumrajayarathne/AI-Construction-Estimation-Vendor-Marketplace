"""
ACEVM-28 - Test documents.

Small fake PDFs, one for each kind of document we expect from customers.
The tests use these so we don't have to commit real client drawings.
scripts/make_sample_pdfs.py writes the same files to disk so you can
upload them by hand through the UI too.
"""

import fitz  # PyMuPDF


def drawing_pdf() -> bytes:
    """Ground floor plan - short labels and dimensions, like a real drawing."""
    doc = fitz.open()
    page = doc.new_page()  # A4 by default
    page.insert_text((72, 60), "GROUND FLOOR PLAN - SCALE 1:100", fontsize=14)
    # outline of a room, just so the page isn't only text
    page.draw_rect(fitz.Rect(100, 120, 400, 320), color=(0, 0, 0), width=1.5)
    page.insert_text((200, 220), "LIVING ROOM 4500 x 3600", fontsize=10)
    page.insert_text((100, 350), "External walls: 230mm brick wall", fontsize=10)
    page.insert_text((100, 370), "Internal walls: 115mm brick wall", fontsize=10)
    page.insert_text((100, 390), "Floor to ceiling height: 3000mm", fontsize=10)
    data = doc.tobytes()
    doc.close()
    return data


def specification_pdf() -> bytes:
    """Two pages of spec text. Page 2 is long so it gets split into more than one chunk."""
    doc = fitz.open()

    page1 = doc.new_page()
    page1.insert_textbox(
        fitz.Rect(72, 72, 520, 770),
        "SECTION 1 - MASONRY\n\n"
        "1.1 Bricks shall be well burnt clay bricks of size 215 x 105 x 65 mm.\n\n"
        "1.2 Cement sand mortar 1:5 shall be used for all brick work.\n\n"
        "1.3 Walls shall be cured for a minimum of 7 days.",
        fontsize=11,
    )

    page2 = doc.new_page()
    long_text = "\n\n".join(
        f"2.{i} Plastering: 16mm thick cement sand plaster 1:4 on internal walls, "
        f"finished smooth with a wooden float and cured for 7 days before painting."
        for i in range(1, 21)
    )
    page2.insert_textbox(fitz.Rect(40, 40, 560, 800), "SECTION 2 - FINISHES\n\n" + long_text, fontsize=7)

    data = doc.tobytes()
    doc.close()
    return data


def boq_pdf() -> bytes:
    """An existing BOQ with a ruled table, so the table detection has something to find."""
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 60), "BILL OF QUANTITIES - MASONRY", fontsize=14)

    rows = [
        ["Item", "Description", "Unit", "Qty"],
        ["1", "230mm brick wall", "m2", "120"],
        ["2", "115mm brick wall", "m2", "85"],
        ["3", "Cement plaster 16mm", "m2", "410"],
    ]
    col_x = [72, 120, 380, 450, 520]  # column edges
    row_h = 24
    top = 90

    for r, row in enumerate(rows):
        y0 = top + r * row_h
        for c, cell in enumerate(row):
            # draw every cell border - the default find_tables() strategy looks for lines
            page.draw_rect(fitz.Rect(col_x[c], y0, col_x[c + 1], y0 + row_h), color=(0, 0, 0), width=0.8)
            page.insert_text((col_x[c] + 4, y0 + 16), cell, fontsize=10)

    data = doc.tobytes()
    doc.close()
    return data


def scanned_pdf() -> bytes:
    """Page 1 has text, page 2 is only an image (like a scan) so it has no text layer."""
    doc = fitz.open()
    page1 = doc.new_page()
    page1.insert_text((72, 72), "Site photo attached on next page", fontsize=11)

    page2 = doc.new_page()
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 60, 60), False)
    pix.clear_with(180)  # plain grey square is enough to act as a "scan"
    page2.insert_image(fitz.Rect(72, 72, 472, 472), pixmap=pix)

    data = doc.tobytes()
    doc.close()
    return data


def encrypted_pdf() -> bytes:
    """A password protected PDF - we can't read these, so processing should fail cleanly."""
    doc = fitz.open()
    doc.new_page().insert_text((72, 72), "Confidential tender drawing")
    data = doc.tobytes(
        encryption=fitz.PDF_ENCRYPT_AES_256,
        owner_pw="owner123",
        user_pw="user123",
    )
    doc.close()
    return data


# name -> (builder, document_kind to upload it as)
SAMPLE_DOCUMENTS = {
    "sample_drawing.pdf": (drawing_pdf, "drawing"),
    "sample_specification.pdf": (specification_pdf, "specification"),
    "sample_existing_boq.pdf": (boq_pdf, "existing_boq"),
    "sample_scanned.pdf": (scanned_pdf, "other"),
    "sample_encrypted.pdf": (encrypted_pdf, "other"),
}
