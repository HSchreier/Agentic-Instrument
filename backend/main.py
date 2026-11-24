"""
Agentic Instrument v2.1 — Backend MIDI Service with WebSocket
Phase 2: Native MIDI driver integration + real-time events
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import logging
from typing import Dict

from midi_driver import midi_driver, MidiPort
from device_drivers import get_driver, list_drivers

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Active device drivers
device_drivers: Dict[str, object] = {}


# ========== REST API ==========

@app.route('/api/health', methods=['GET'])
def health():
    """Service health check"""
    return jsonify({
        'status': 'ok',
        'version': '2.1.0-container',
        'service': 'agentic-instrument-backend',
        'midi_available': True
    })


@app.route('/api/devices', methods=['GET'])
def list_devices():
    """Scan and list available MIDI ports"""
    ports = midi_driver.scan_ports(force=True)
    devices = []

    for port in ports:
        # Detect device type from port name
        port_lower = port.name.lower()
        if 'wolf' in port_lower:
            device_type = 'rhythm-wolf'
        elif 'digitakt' in port_lower:
            device_type = 'elektron-digitakt-2'
        elif 'rytm' in port_lower or ('elektron' in port_lower and 'rytm' in port_lower):
            device_type = 'elektron-rytm-mkii'
        elif 'tr-8s' in port_lower or 'tr8s' in port_lower:
            device_type = 'roland-tr8s'
        elif 'op-z' in port_lower or 'opz' in port_lower:
            device_type = 'op-z'
        elif 'volca' in port_lower:
            device_type = 'volca-keys'
        elif 'maschine' in port_lower:
            device_type = 'maschine-mk3'
        else:
            device_type = 'generic-midi'

        devices.append({
            'id': port.port_id,
            'name': port.name,
            'type': device_type,
            'online': port.online
        })

    return jsonify({
        'devices': devices,
        'count': len(devices),
        'timestamp': int(__import__('time').time() * 1000)
    })


@app.route('/api/send', methods=['POST'])
def send_pattern():
    """Send pattern to device via REST"""
    data = request.json or {}
    device_id = data.get('deviceId')
    pattern = data.get('pattern')
    velocity = data.get('velocity', 100)

    if not device_id or not pattern:
        return jsonify({'error': 'Missing deviceId or pattern'}), 400

    # Map device_id to port_name
    ports = midi_driver.scan_ports()
    port = next((p for p in ports if p.port_id == device_id), None)

    if not port:
        return jsonify({'error': 'Device not found'}), 404

    # Connect and send
    try:
        driver = device_drivers.get(device_id)
        if not driver:
            driver = get_driver(device_id)
            driver.connect(port.name)
            device_drivers[device_id] = driver

        success = driver.send_pattern(pattern, velocity)
        events_count = sum(len(row) for row in pattern if row)

        return jsonify({
            'sent': success,
            'deviceId': device_id,
            'eventsCount': events_count,
            'timestamp': int(__import__('time').time() * 1000)
        })
    except Exception as e:
        logger.error(f"Error sending pattern: {e}")
        return jsonify({'error': str(e)}), 500


# ========== WEBSOCKET EVENTS ==========

@socketio.on('connect')
def on_connect():
    """Client connects"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Backend connected'})


@socketio.on('disconnect')
def on_disconnect():
    """Client disconnects"""
    logger.info(f"Client disconnected: {request.sid}")


@socketio.on('scan_devices')
def on_scan_devices():
    """Scan for MIDI devices"""
    ports = midi_driver.scan_ports(force=True)
    devices = []

    for port in ports:
        devices.append({
            'id': port.port_id,
            'name': port.name,
            'type': 'rhythm-wolf' if 'wolf' in port.name.lower() else 'generic-midi',
            'online': port.online
        })

    emit('devices_detected', {
        'devices': devices,
        'count': len(devices),
        'timestamp': int(__import__('time').time() * 1000)
    })


@socketio.on('send_pattern')
def on_send_pattern(data):
    """Send pattern via WebSocket"""
    device_id = data.get('deviceId')
    pattern = data.get('pattern')
    velocity = data.get('velocity', 100)

    if not device_id or not pattern:
        emit('pattern_send_error', {
            'deviceId': device_id,
            'error': 'Missing deviceId or pattern',
            'code': 'INVALID_INPUT'
        })
        return

    try:
        # Scan ports to find device
        ports = midi_driver.scan_ports()
        port = next((p for p in ports if p.port_id == device_id), None)

        if not port:
            emit('pattern_send_error', {
                'deviceId': device_id,
                'error': 'Device not found',
                'code': 'DEVICE_NOT_FOUND'
            })
            return

        # Get or create driver
        driver = device_drivers.get(device_id)
        if not driver:
            driver = get_driver(device_id)
            if not driver.connect(port.name):
                emit('pattern_send_error', {
                    'deviceId': device_id,
                    'error': 'Failed to connect',
                    'code': 'CONNECT_FAILED'
                })
                return
            device_drivers[device_id] = driver

        # Send pattern
        events_count = sum(len(row) for row in pattern if row)
        success = driver.send_pattern(pattern, velocity)

        emit('pattern_sent', {
            'deviceId': device_id,
            'sent': success,
            'eventsCount': events_count,
            'duration_ms': 125,
            'timestamp': int(__import__('time').time() * 1000)
        })
    except Exception as e:
        logger.error(f"Error in send_pattern: {e}")
        emit('pattern_send_error', {
            'deviceId': device_id,
            'error': str(e),
            'code': 'INTERNAL_ERROR'
        })


# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    # Clean shutdown
    import atexit
    atexit.register(midi_driver.close_all)

    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
