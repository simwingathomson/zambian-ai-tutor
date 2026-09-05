def test_register_rejects_short_password(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "learner@example.com", "full_name": "Learner One", "password": "short"},
    )

    assert response.status_code == 422


def test_register_and_login(client):
    payload = {"email": "learner@example.com", "full_name": "Learner One", "password": "strongpass123"}
    register_response = client.post("/api/auth/register", json=payload)

    assert register_response.status_code == 201
    assert register_response.json()["user"]["role"] == "student"
    assert register_response.json()["access_token"]

    login_response = client.post(
        "/api/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )

    assert login_response.status_code == 200
    assert login_response.json()["access_token"]


def test_public_register_cannot_create_admin(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "not-admin@example.com",
            "full_name": "Not Admin",
            "password": "strongpass123",
            "role": "admin",
        },
    )

    assert response.status_code == 201
    assert response.json()["user"]["role"] == "student"
