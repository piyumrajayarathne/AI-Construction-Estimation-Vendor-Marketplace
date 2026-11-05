from fastapi.testclient import TestClient

from tests.conftest import auth_header, register_user


def test_register_customer_and_login(client: TestClient) -> None:
    register_user(client, "customer@example.com", role="customer", full_name="Amal Perera")
    login = client.post(
        "/api/auth/login",
        json={"email": "customer@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    body = login.json()
    assert "access_token" in body
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    data = me.json()
    assert data["email"] == "customer@example.com"
    assert data["role"] == "customer"
    assert data["full_name"] == "Amal Perera"


def test_register_vendor(client: TestClient) -> None:
    register_user(client, "vendor@example.com", role="vendor", full_name="Lanka Supplies")
    headers = auth_header(client, "vendor@example.com")
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["role"] == "vendor"


def test_reject_self_admin(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "email": "admin@example.com",
            "password": "password123",
            "full_name": "Admin",
            "role": "admin",
        },
    )
    assert response.status_code == 400
    assert "customer or vendor" in response.json()["detail"]


def test_duplicate_email(client: TestClient) -> None:
    register_user(client, "dup@example.com")
    again = client.post(
        "/api/auth/register",
        json={
            "email": "dup@example.com",
            "password": "password123",
            "full_name": "Other",
            "role": "customer",
        },
    )
    assert again.status_code == 409


def test_me_requires_auth(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401


def test_login_rejects_bad_password(client: TestClient) -> None:
    register_user(client, "badpass@example.com")
    response = client.post(
        "/api/auth/login",
        json={"email": "badpass@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401
