# WebSocket API Specification
## Agentic Instrument v2.1 — Browser ↔ Backend Communication

**Base URL:** `ws://localhost:8081`  
**HTTP REST (health checks):** `http://localhost:5000/api`

---

## Connection Flow

```
Browser (React + Zustand)
  ↓ [WebSocket upgrade]
  ↓
Backend Service (Flask + SocketIO)
  ↓
Native MIDI Drivers (libmidi bindings)
  ↓
Hardware (Rhythm Wolf, Elektron, Roland, etc.)
```

---

## REST API (Health & Status)

### GET `/api/health`
Service health check.

**Response:**
```json
{
  "status": "ok",
  "version": "2.1.0-container",
  "service": "agentic-instrument-backend"
}
```

### GET `/api/devices`
List detected MIDI devices.

**Response:**
```json
{
  "devices": ["rhythm-wolf-001", "elektron-rytm-002", "roland-tr8s-003"],
  "count": 3
}
```

### GET `/api/devices/{deviceId}`
Get device details (topology, capabilities).

**Response:**
```json
{
  "id": "rhythm-wolf-001",
  "name": "Akai Rhythm Wolf",
  "type": "rhythm-wolf",
  "port": "USB001",
  "voices": 6,
  "pages": 1,
  "midiChannel": 1,
  "online": true
}
```

---

## WebSocket Events

### Client → Server

#### `connect`
Browser connects to backend service. No payload.

#### `scan_devices`
Request device scan (hotplug detection).

**Payload:**
```json
{}
```

**Response Event:** `devices_updated` (see below)

#### `send_pattern`
Send pattern to device via native MIDI.

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001",
  "pattern": [
    [0, 60, 0, 60, 0, 60, 0, 60],
    [0, 64, 0, 64, 0, 64, 0, 64],
    [0, 67, 0, 67, 0, 67, 0, 67],
    [0, 72, 0, 72, 0, 72, 0, 72],
    [0, 69, 0, 69, 0, 69, 0, 69],
    [0, 71, 0, 71, 0, 71, 0, 71]
  ],
  "velocity": 100,
  "timing": "immediate"
}
```

**Response Event:** `pattern_sent` (see below)

#### `start_listening`
Enable real-time MIDI input from device (listen mode).

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001"
}
```

#### `stop_listening`
Disable real-time MIDI input.

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001"
}
```

---

### Server → Client

#### `devices_detected`
Initial device list on connection.

**Payload:**
```json
{
  "devices": [
    {
      "id": "rhythm-wolf-001",
      "name": "Akai Rhythm Wolf",
      "type": "rhythm-wolf",
      "port": "USB001",
      "voices": 6,
      "pages": 1,
      "online": true
    }
  ],
  "timestamp": 1700817600000
}
```

#### `devices_updated`
Device list changed (hotplug detected).

**Payload:**
```json
{
  "added": ["elektron-rytm-002"],
  "removed": [],
  "devices": [
    {
      "id": "rhythm-wolf-001",
      "name": "Akai Rhythm Wolf",
      "type": "rhythm-wolf",
      "online": true
    },
    {
      "id": "elektron-rytm-002",
      "name": "Elektron Analog Rytm MKII",
      "type": "elektron-rytm-mkii",
      "online": true
    }
  ]
}
```

#### `pattern_sent`
Confirmation that pattern was sent to device.

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001",
  "sent": true,
  "eventsCount": 48,
  "duration_ms": 125,
  "timestamp": 1700817600123
}
```

#### `pattern_send_error`
Error sending pattern.

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001",
  "error": "Device offline",
  "code": "DEVICE_OFFLINE"
}
```

#### `midi_input`
Real-time MIDI input received from device (listening mode).

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001",
  "eventType": "note_on",
  "noteNumber": 60,
  "velocity": 100,
  "channel": 0,
  "timestamp": 1700817600123
}
```

#### `device_disconnected`
Device unplugged or offline.

**Payload:**
```json
{
  "deviceId": "rhythm-wolf-001",
  "reason": "usb_disconnect"
}
```

#### `error`
Generic error event.

**Payload:**
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

---

## Device Adapter Interface (Python)

Each device driver implements:

```python
class DeviceAdapter:
    id: str                    # 'rhythm-wolf', 'elektron-rytm-mkii', etc.
    name: str                  # 'Akai Rhythm Wolf'
    voices: int                # 6, 12, 16, etc.
    pages: int                 # 1 or more
    midi_channel: int          # 1-16

    def connect(self, port: str) -> bool:
        """Connect to device on USB port"""

    def disconnect(self) -> bool:
        """Disconnect and cleanup"""

    def send_pattern(self, pattern: List[List[int]]) -> bool:
        """Send 8×16 universal pattern to device"""

    def receive_pattern(self) -> Optional[List[List[int]]]:
        """Listen for incoming MIDI, return as 8×16"""

    def is_online(self) -> bool:
        """Check if device is connected"""

    def get_topology(self) -> Dict:
        """Return device voice topology"""
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `DEVICE_OFFLINE` | Device not connected or USB unplugged |
| `DEVICE_BUSY` | Device is processing previous pattern |
| `INVALID_PATTERN` | Pattern format incorrect or too large |
| `MIDI_ERROR` | Native MIDI error (port error, driver crash) |
| `TIMEOUT` | Device did not respond |
| `DRIVER_NOT_AVAILABLE` | Device driver not installed/compiled |

---

## Browser Integration (React)

```typescript
const ws = new WebSocket('ws://localhost:8081/socket.io/?transport=websocket')

ws.on('devices_detected', (devices) => {
  store.setDetected(devices)  // Update Zustand store
})

ws.emit('send_pattern', {
  deviceId: selectedAdapter.id,
  pattern: toDevice(pattern, selectedAdapter),
  velocity: 100
})
```

---

## Latency Targets

- Pattern send → device: **< 100ms**
- Device hotplug detection: **< 500ms**
- WebSocket message round-trip: **< 50ms**

**Heavy traffic (1000+ events/sec):** Backend queues events, streams via WebSocket.
