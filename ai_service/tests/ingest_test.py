import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from api.app import app

client = TestClient(app)

INTERNAL_KEY = "test-key"

@pytest.fixture(autouse=True)
def mock_env(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_KEY", INTERNAL_KEY)
    monkeypatch.setenv("GOOGLE_API_KEY",   "fake-key")
    monkeypatch.setenv("DATABASE_URL",     "postgresql://fake")
    monkeypatch.setenv("EXPRESS_BASE_URL", "http://localhost:5000")


# ── POST /ingest ─────────────────────────────────────────────────────────────

def test_ingest_returns_202_immediately():
    with patch("routers.ingest.run_ingest_pipeline", new_callable=AsyncMock):
        res = client.post(
            "/ingest",
            json={
                "file_id":   "test-file-id",
                "file_url":  "https://s3.example.com/file.pdf",
                "file_type": "pdf",
                "category":  "health_report",
            },
            headers={"X-Internal-Key": INTERNAL_KEY},
        )
    assert res.status_code == 200
    assert res.json()["file_id"] == "test-file-id"


def test_ingest_rejects_without_key():
    res = client.post(
        "/ingest",
        json={
            "file_id":   "test-file-id",
            "file_url":  "https://s3.example.com/file.pdf",
            "file_type": "pdf",
            "category":  "health_report",
        },
    )
    assert res.status_code == 422  # missing header


def test_ingest_rejects_wrong_key():
    res = client.post(
        "/ingest",
        json={
            "file_id":   "test-file-id",
            "file_url":  "https://s3.example.com/file.pdf",
            "file_type": "pdf",
            "category":  "health_report",
        },
        headers={"X-Internal-Key": "wrong-key"},
    )
    assert res.status_code == 401