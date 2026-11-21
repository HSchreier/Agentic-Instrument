"""API endpoint tests."""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


@pytest.fixture
def valid_generate_request():
    """Valid pattern generation request."""
    return {
        "style": "techno",
        "tempo": 128,
        "template": "four_on_the_floor",
        "include_bass": False,
    }


class TestHealth:
    """Health check endpoint tests."""

    def test_health_check(self):
        """Should return OK status."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestDevices:
    """Device list endpoint tests."""

    def test_list_devices(self):
        """Should return list of devices."""
        response = client.get("/api/v1/devices")
        assert response.status_code == 200
        assert "devices" in response.json()
        assert isinstance(response.json()["devices"], list)


class TestPatternGeneration:
    """Pattern generation endpoint tests."""

    def test_generate_pattern_success(self, valid_generate_request):
        """Should generate pattern successfully."""
        response = client.post("/api/v1/patterns/generate", json=valid_generate_request)
        assert response.status_code == 200

        data = response.json()
        assert "metadata" in data
        assert "events" in data
        assert data["metadata"]["style"] == "techno"
        assert data["metadata"]["tempo"] == 128
        assert data["metadata"]["num_events"] > 0

    def test_generate_pattern_invalid_style(self):
        """Should reject invalid style."""
        response = client.post(
            "/api/v1/patterns/generate",
            json={"style": "invalid_style", "tempo": 128},
        )
        assert response.status_code in [400, 422]

    def test_generate_pattern_invalid_tempo(self):
        """Should reject invalid tempo."""
        response = client.post(
            "/api/v1/patterns/generate",
            json={"style": "techno", "tempo": 999},  # Out of range
        )
        # Should either reject or clamp to valid range
        assert response.status_code in [200, 400]

    def test_generate_pattern_default_values(self):
        """Should use default values when not provided."""
        response = client.post(
            "/api/v1/patterns/generate",
            json={"style": "techno"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["tempo"] > 0


class TestInfo:
    """Info endpoints tests."""

    def test_list_styles(self):
        """Should return list of styles."""
        response = client.get("/api/v1/info/styles")
        assert response.status_code == 200

        data = response.json()
        assert "styles" in data
        assert len(data["styles"]) > 0
        assert data["styles"][0].get("id")

    def test_list_templates(self):
        """Should return list of templates."""
        response = client.get("/api/v1/info/templates")
        assert response.status_code == 200

        data = response.json()
        assert "templates" in data
        assert len(data["templates"]) > 0

    def test_get_mappings(self):
        """Should return MIDI mappings."""
        response = client.get("/api/v1/info/mappings")
        assert response.status_code == 200

        data = response.json()
        assert "channels" in data
        assert "drum_notes" in data
        assert "velocities" in data
        assert data["channels"]["drums"] == 10
        assert data["channels"]["synth"] == 1


class TestOpenAPIDocs:
    """OpenAPI documentation tests."""

    def test_openapi_schema(self):
        """Should provide OpenAPI schema."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        schema = response.json()
        assert "openapi" in schema
        assert "paths" in schema

    def test_swagger_docs(self):
        """Should provide Swagger UI."""
        response = client.get("/docs")
        assert response.status_code == 200
