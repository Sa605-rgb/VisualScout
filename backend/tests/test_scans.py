import io

from PIL import Image

from main import app
from routers.scans import get_detector


def auth_header(client, email):
    client.post(
        "/auth/register",
        json={"name": "Shop", "email": email, "password": "secret12"},
    )
    login = client.post("/auth/login", json={"email": email, "password": "secret12"})
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def jpeg_bytes():
    buffer = io.BytesIO()
    Image.new("RGB", (8, 8), "white").save(buffer, format="JPEG")
    return buffer.getvalue()


def fake_detector():
    return lambda _raw: {"bottle": 1, "cup": 6, "chair": 2}


def test_dashboard_before_scan(client):
    headers = auth_header(client, "dash@example.com")
    response = client.get("/dashboard", headers=headers)
    assert response.status_code == 200
    body = response.json()
    assert body["scanned"] is False
    assert body["alerts"] == []
    assert body["products"][0]["status"] == "Not scanned"


def test_scan_creates_a_low_stock_alert(client):
    headers = auth_header(client, "scan@example.com")
    app.dependency_overrides[get_detector] = fake_detector
    try:
        created = client.post(
            "/scans",
            headers=headers,
            files={"file": ("shelf.jpg", jpeg_bytes(), "image/jpeg")},
        )
    finally:
        app.dependency_overrides.pop(get_detector, None)

    assert created.status_code == 201
    body = created.json()
    assert body["low_count"] == 1
    assert body["alerts"][0]["name"] == "Bottles"
    assert body["alerts"][0]["count"] == 1
    assert body["other"] == [{"name": "chair", "count": 2}]
    assert body["image_url"].startswith("/uploads/")

    dashboard = client.get("/dashboard", headers=headers)
    assert dashboard.json()["alerts"][0]["name"] == "Bottles"
    history = client.get("/scans", headers=headers)
    assert history.json()[0]["id"] == body["id"]


def test_scan_requires_login_and_a_real_file(client):
    assert client.post("/scans").status_code == 401
    headers = auth_header(client, "badfile@example.com")
    response = client.post(
        "/scans",
        headers=headers,
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400
