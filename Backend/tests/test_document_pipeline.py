"""
API tests for upload + processing, using the sample documents.
(The original tests in test_documents.py still run as well.)
"""

from io import BytesIO

from fastapi.testclient import TestClient

from tests import sample_documents as samples
from tests.conftest import auth_header, register_user


def _setup(client: TestClient, email: str) -> tuple[dict[str, str], str]:
    register_user(client, email)
    headers = auth_header(client, email)
    project = client.post("/api/projects", headers=headers, json={"name": "Pipeline job"})
    assert project.status_code == 201
    return headers, project.json()["id"]


def _upload(client, headers, project_id, data: bytes, name="file.pdf", kind="other"):
    return client.post(
        f"/api/projects/{project_id}/documents",
        headers=headers,
        files={"file": (name, BytesIO(data), "application/pdf")},
        data={"document_kind": kind},
    )


def test_boq_upload_is_processed_with_tables(client: TestClient) -> None:
    headers, project_id = _setup(client, "pipe-boq@example.com")
    upload = _upload(client, headers, project_id, samples.boq_pdf(), "boq.pdf", "existing_boq")
    assert upload.status_code == 202, upload.text
    doc_id = upload.json()["id"]

    # TestClient runs background tasks before it returns, so processing is already done here
    doc = client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers).json()
    assert doc["status"] == "processed"
    assert doc["document_kind"] == "existing_boq"
    assert doc["page_count"] == 1
    assert doc["parse_metadata"]["table_count"] >= 1
    assert doc["parse_metadata"]["chunk_count"] >= 1

    chunks = client.get(f"/api/projects/{project_id}/documents/{doc_id}/chunks", headers=headers).json()
    assert any(c["metadata"]["has_table"] for c in chunks)


def test_scanned_pages_are_reported_as_missing_data(client: TestClient) -> None:
    headers, project_id = _setup(client, "pipe-scan@example.com")
    doc_id = _upload(client, headers, project_id, samples.scanned_pdf(), "scan.pdf").json()["id"]

    doc = client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers).json()
    assert doc["status"] == "processed"
    assert doc["parse_metadata"]["scanned_pages"] == [2]
    assert "OCR" in doc["parse_metadata"]["missing_data"][0]


def test_encrypted_pdf_fails_with_readable_message(client: TestClient) -> None:
    headers, project_id = _setup(client, "pipe-lock@example.com")
    doc_id = _upload(client, headers, project_id, samples.encrypted_pdf(), "locked.pdf").json()["id"]

    doc = client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers).json()
    assert doc["status"] == "failed"
    assert "password" in doc["error_message"].lower()


def test_upload_rejects_wrong_extension_and_empty_file(client: TestClient) -> None:
    headers, project_id = _setup(client, "pipe-bad@example.com")

    # real PDF bytes but a .docx name -> rejected
    assert _upload(client, headers, project_id, samples.drawing_pdf(), "plan.docx").status_code == 400
    # empty file -> rejected
    assert _upload(client, headers, project_id, b"", "empty.pdf").status_code == 400
    # unknown kind -> rejected
    assert _upload(client, headers, project_id, samples.drawing_pdf(), "plan.pdf", "invoice").status_code == 400


def test_reprocess_replaces_chunks_instead_of_duplicating(client: TestClient) -> None:
    headers, project_id = _setup(client, "pipe-re@example.com")
    doc_id = _upload(client, headers, project_id, samples.drawing_pdf(), "plan.pdf", "drawing").json()["id"]
    base = f"/api/projects/{project_id}/documents/{doc_id}"

    before = client.get(f"{base}/chunks", headers=headers).json()
    again = client.post(f"{base}/reprocess", headers=headers)
    assert again.status_code == 202
    after = client.get(f"{base}/chunks", headers=headers).json()

    assert len(after) == len(before)
    assert client.get(base, headers=headers).json()["status"] == "processed"
