from fastapi.testclient import TestClient
from api.routes.app import app
import pytest

@pytest.fixture
def client():
    return TestClient(app)