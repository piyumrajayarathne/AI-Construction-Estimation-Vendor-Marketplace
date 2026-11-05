from io import BytesIO

import fitz
from fastapi.testclient import TestClient

from tests.conftest import auth_header, register_user


def _pdf_bytes(text: str = "230mm brick wall") -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text)
    data = doc.tobytes()
    doc.close()
    return data


def _headers(client: TestClient, email: str) -> dict[str, str]:
    register_user(client, email)
    return auth_header(client, email)


def _project(client: TestClient, headers: dict[str, str]) -> str:
    response = client.post("/api/projects", headers=headers, json={"name": "Docs job"})
    assert response.status_code == 201
    return response.json()["id"]


def test_upload_pdf_processes_and_returns_chunks(client: TestClient) -> None:
    headers = _headers(client, "docs@example.com")
    project_id = _project(client, headers)
    files = {"file": ("wall.pdf", BytesIO(_pdf_bytes()), "application/pdf")}
    upload = client.post(
        f"/api/projects/{project_id}/documents",
        headers=headers,
        files=files,
        data={"document_kind": "drawing"},
    )
    assert upload.status_code == 202, upload.text
    body = upload.json()
    assert body["status"] in {"pending", "processing", "processed"}
    assert body["file_name"] == "wall.pdf"
    assert "storage_key" not in body
    assert "/uploads" not in str(body)
    doc_id = body["id"]

    detail = client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["status"] == "processed"
    assert detail.json()["verification_status"] == "unverified"

    listed = client.get(f"/api/projects/{project_id}/documents", headers=headers)
    assert listed.status_code == 200
    assert listed.json()[0]["id"] == doc_id

    chunks = client.get(
        f"/api/projects/{project_id}/documents/{doc_id}/chunks",
        headers=headers,
    )
    assert chunks.status_code == 200
    payload = chunks.json()
    assert payload
    assert "230mm brick wall" in payload[0]["content"]
    assert payload[0]["metadata"]["page_number"] == 1


def test_reject_non_pdf(client: TestClient) -> None:
    headers = _headers(client, "nopdf@example.com")
    project_id = _project(client, headers)
    files = {"file": ("notes.txt", BytesIO(b"not a pdf"), "text/plain")}
    response = client.post(
        f"/api/projects/{project_id}/documents",
        headers=headers,
        files=files,
    )
    assert response.status_code == 400


def test_failed_status_for_corrupt_pdf(client: TestClient) -> None:
    headers = _headers(client, "badpdf@example.com")
    project_id = _project(client, headers)
    files = {"file": ("bad.pdf", BytesIO(b"%PDF-broken"), "application/pdf")}
    upload = client.post(
        f"/api/projects/{project_id}/documents",
        headers=headers,
        files=files,
    )
    assert upload.status_code == 202
    doc_id = upload.json()["id"]
    detail = client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers)
    assert detail.json()["status"] == "failed"


def test_document_ownership(client: TestClient) -> None:
    headers_a = _headers(client, "da@example.com")
    register_user(client, "db@example.com")
    headers_b = auth_header(client, "db@example.com")
    project_id = _project(client, headers_a)
    files = {"file": ("wall.pdf", BytesIO(_pdf_bytes()), "application/pdf")}
    upload = client.post(
        f"/api/projects/{project_id}/documents",
        headers=headers_a,
        files=files,
    )
    doc_id = upload.json()["id"]
    assert (
        client.get(f"/api/projects/{project_id}/documents/{doc_id}", headers=headers_b).status_code
        == 404
    )


def test_estimation_stub_has_no_fake_lines(client: TestClient) -> None:
    headers = _headers(client, "est2@example.com")
    project_id = _project(client, headers)
    gotten = client.get(f"/api/projects/{project_id}/estimation", headers=headers)
    assert gotten.status_code == 200
    body = gotten.json()
    assert body["status"] in {"pending", "unavailable"}
    assert body["lines"] == []
    assert body["verification_status"] == "unverified"
    posted = client.post(f"/api/projects/{project_id}/estimation", headers=headers, json={})
    assert posted.status_code == 200
    assert posted.json()["lines"] == []
    assert posted.json()["status"] in {"pending", "unavailable"}
