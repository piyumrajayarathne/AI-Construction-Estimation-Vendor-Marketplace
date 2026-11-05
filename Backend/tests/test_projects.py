from fastapi.testclient import TestClient

from tests.conftest import auth_header, register_user


def _create_project(client: TestClient, headers: dict[str, str], name: str = "Block A") -> dict:
    response = client.post(
        "/api/projects",
        headers=headers,
        json={
            "name": name,
            "description": "Residential masonry",
            "location": "Colombo, Sri Lanka",
            "budget_cap": 1000000,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_create_and_list_own_projects(client: TestClient) -> None:
    register_user(client, "owner@example.com", full_name="Owner")
    headers = auth_header(client, "owner@example.com")
    created = _create_project(client, headers, "Benchmark Residences")
    assert created["name"] == "Benchmark Residences"
    assert created["status"] == "draft"
    listed = client.get("/api/projects", headers=headers)
    assert listed.status_code == 200
    names = [item["name"] for item in listed.json()]
    assert "Benchmark Residences" in names


def test_project_ownership(client: TestClient) -> None:
    register_user(client, "a@example.com", full_name="A")
    register_user(client, "b@example.com", full_name="B")
    headers_a = auth_header(client, "a@example.com")
    headers_b = auth_header(client, "b@example.com")
    project = _create_project(client, headers_a, "A only")
    pid = project["id"]

    assert client.get(f"/api/projects/{pid}", headers=headers_a).status_code == 200
    assert client.get(f"/api/projects/{pid}", headers=headers_b).status_code == 404
    patch = client.patch(
        f"/api/projects/{pid}",
        headers=headers_b,
        json={"name": "Hijacked"},
    )
    assert patch.status_code == 404
    updated = client.patch(
        f"/api/projects/{pid}",
        headers=headers_a,
        json={"name": "A only revised"},
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "A only revised"

    listed_b = client.get("/api/projects", headers=headers_b)
    assert listed_b.json() == []


def test_cannot_self_mark_estimated(client: TestClient) -> None:
    register_user(client, "est@example.com")
    headers = auth_header(client, "est@example.com")
    project = _create_project(client, headers)
    response = client.patch(
        f"/api/projects/{project['id']}",
        headers=headers,
        json={"status": "estimated"},
    )
    assert response.status_code == 400
