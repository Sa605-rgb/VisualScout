import os
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "test_visualscout.db"
if DB_PATH.exists():
    DB_PATH.unlink()

os.environ["DATABASE_URL"] = f"sqlite:///{DB_PATH.as_posix()}"
os.environ["SECRET_KEY"] = "test-secret"

import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
    from database import engine

    engine.dispose()
    if DB_PATH.exists():
        DB_PATH.unlink()
