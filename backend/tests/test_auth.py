def test_register_and_me(client):
    created = client.post(
        "/auth/register",
        json={"name": "Samavia", "email": "samavia@example.com", "password": "secret12"},
    )
    assert created.status_code == 201
    body = created.json()
    assert body["email"] == "samavia@example.com"
    assert body["language"] == "en"
    assert "password" not in body

    logged_in = client.post(
        "/auth/login",
        json={"email": "samavia@example.com", "password": "secret12"},
    )
    assert logged_in.status_code == 200
    token = logged_in.json()["access_token"]
    assert logged_in.json()["token_type"] == "bearer"

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Samavia"
    assert me.json()["id"] == body["id"]


def test_duplicate_email(client):
    payload = {"name": "A", "email": "dup@example.com", "password": "secret12"}
    assert client.post("/auth/register", json=payload).status_code == 201
    again = client.post("/auth/register", json=payload)
    assert again.status_code == 400
    assert again.json()["detail"] == "Email already registered"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={"name": "B", "email": "wrong@example.com", "password": "secret12"},
    )
    response = client.post(
        "/auth/login",
        json={"email": "wrong@example.com", "password": "nope-nope"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Wrong email or password"


def test_login_unknown_email(client):
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "secret12"},
    )
    assert response.status_code == 401


def test_me_without_token(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not logged in"


def test_short_password_rejected(client):
    response = client.post(
        "/auth/register",
        json={"name": "C", "email": "short@example.com", "password": "123"},
    )
    assert response.status_code == 422
