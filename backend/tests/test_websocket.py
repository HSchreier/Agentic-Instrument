"""
WebSocket API Tests — Verify real-time communication
"""
import pytest
import json
from main import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestHealthEndpoint:
    """Test health check and service status"""

    def test_health_check(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'ok'
        assert data['version'] == '2.1.0-container'
        assert data['service'] == 'agentic-instrument-backend'

    def test_health_response_format(self, client):
        response = client.get('/api/health')
        data = response.json
        assert isinstance(data, dict)
        assert 'status' in data
        assert 'version' in data


class TestDeviceEndpoints:
    """Test device discovery and management"""

    def test_list_devices_empty(self, client):
        response = client.get('/api/devices')
        assert response.status_code == 200
        data = response.json
        assert 'devices' in data
        assert 'count' in data
        assert isinstance(data['devices'], list)

    def test_get_nonexistent_device(self, client):
        response = client.get('/api/devices/nonexistent')
        assert response.status_code == 404
        data = response.json
        assert 'error' in data


class TestSendEndpoint:
    """Test pattern sending via REST API"""

    def test_send_missing_deviceid(self, client):
        response = client.post('/api/send', json={
            'pattern': [[0] * 8] * 16
        })
        assert response.status_code == 400
        assert 'error' in response.json

    def test_send_missing_pattern(self, client):
        response = client.post('/api/send', json={
            'deviceId': 'rhythm-wolf'
        })
        assert response.status_code == 400
        assert 'error' in response.json

    def test_send_device_not_found(self, client):
        response = client.post('/api/send', json={
            'deviceId': 'nonexistent-device',
            'pattern': [[0] * 8] * 16
        })
        assert response.status_code == 404
        assert 'error' in response.json


class TestErrorHandling:
    """Test error responses"""

    def test_404_not_found(self, client):
        response = client.get('/api/nonexistent-endpoint')
        assert response.status_code == 404
        assert 'error' in response.json

    def test_malformed_json(self, client):
        response = client.post('/api/send', 
                             data='invalid json',
                             content_type='application/json')
        # Flask returns 400 for malformed JSON
        assert response.status_code == 400 or response.status_code == 500


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
