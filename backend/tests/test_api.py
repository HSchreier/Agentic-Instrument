import pytest
from main import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json['status'] == 'ok'
    assert response.json['version'] == '2.1.0-container'


def test_list_devices(client):
    response = client.get('/api/devices')
    assert response.status_code == 200
    assert 'devices' in response.json
    assert isinstance(response.json['devices'], list)


def test_send_pattern_missing_data(client):
    response = client.post('/api/send', json={})
    assert response.status_code == 400
    assert 'error' in response.json


def test_send_pattern_device_not_found(client):
    response = client.post('/api/send', json={
        'deviceId': 'nonexistent',
        'pattern': [[0] * 8] * 16
    })
    assert response.status_code == 404
