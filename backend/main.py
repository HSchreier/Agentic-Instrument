"""
Agentic Instrument v2.1 — Backend MIDI Service
Phase 2: Containerized native MIDI driver layer
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MIDI devices registry (will be populated by device drivers)
devices = {}


@app.route('/api/health', methods=['GET'])
def health():
    """Service health check"""
    return jsonify({
        'status': 'ok',
        'version': '2.1.0-container',
        'service': 'agentic-instrument-backend'
    })


@app.route('/api/devices', methods=['GET'])
def list_devices():
    """List detected MIDI devices"""
    return jsonify({
        'devices': list(devices.keys()),
        'count': len(devices)
    })


@app.route('/api/devices/<device_id>', methods=['GET'])
def get_device(device_id):
    """Get device details"""
    if device_id not in devices:
        return jsonify({'error': 'Device not found'}), 404
    return jsonify(devices[device_id])


@app.route('/api/send', methods=['POST'])
def send_pattern():
    """Send pattern to device via native MIDI"""
    data = request.json
    device_id = data.get('deviceId')
    pattern = data.get('pattern')

    if not device_id or not pattern:
        return jsonify({'error': 'Missing deviceId or pattern'}), 400

    if device_id not in devices:
        return jsonify({'error': 'Device not found'}), 404

    logger.info(f"Sending pattern to {device_id}: {len(pattern)} rows")
    # TODO: Implement native MIDI sending via device drivers
    return jsonify({
        'sent': True,
        'deviceId': device_id,
        'eventsCount': sum(len(row) for row in pattern)
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
