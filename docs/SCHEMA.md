# Data Schemas

## Pattern Object

The core data structure used throughout the toolkit.

```json
{
  "metadata": {
    "style": "string",
    "tempo": "integer",
    "template": "string",
    "num_events": "integer",
    "generated_at": "ISO 8601 timestamp (optional)"
  },
  "events": [
    {
      "channel": "integer (1 or 10)",
      "note": "integer (0-127)",
      "velocity": "integer (0-127)"
    }
  ]
}
```

### Field Descriptions

#### `metadata` (object)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `style` | string | ✓ | Music style: `techno`, `house`, `tech_house`, `minimal` |
| `tempo` | integer | ✓ | Tempo in BPM (20–300) |
| `template` | string | ✗ | Pattern template used: `four_on_the_floor`, `half_time`, `minimal` |
| `num_events` | integer | ✓ | Count of MIDI events in the pattern |
| `generated_at` | string | ✗ | ISO 8601 timestamp when pattern was generated |

#### `events` (array of objects)

Each object represents one MIDI event (note on/off pair).

| Field | Type | Allowed Values | Description |
|-------|------|-----------------|-------------|
| `channel` | integer | 1, 10 | MIDI channel (1=synth, 10=drums) |
| `note` | integer | 0–127 | MIDI note number. Drums: 36 (kick), 38 (snare), 40 (perc), 42 (hat open), 44 (hat closed). Synth: 36–60 (C2–C4). |
| `velocity` | integer | 0–127 | MIDI velocity. Rhythm Wolf responds to 42 (soft), 84 (medium), 127 (accent). 0 = note off. |

---

## Device Object

Represents a connected MIDI output device.

```json
{
  "name": "string",
  "type": "string",
  "port": "integer",
  "is_rhythm_wolf": "boolean"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name of the MIDI device (e.g., "Akai Rhythm Wolf") |
| `type` | string | Device type: `usb`, `midi_din`, `virtual`, `other` |
| `port` | integer | System port number (platform-specific) |
| `is_rhythm_wolf` | boolean | True if device is detected as Rhythm Wolf |

---

## Style Object

Metadata about a music style.

```json
{
  "id": "string",
  "name": "string",
  "tempo_min": "integer",
  "tempo_max": "integer",
  "description": "string",
  "recommended_tempo": "integer"
}
```

### Example

```json
{
  "id": "techno",
  "name": "Techno",
  "tempo_min": 128,
  "tempo_max": 140,
  "description": "Driving, repetitive electronic music with hypnotic rhythms",
  "recommended_tempo": 134
}
```

---

## Template Object

Metadata about a rhythm pattern template.

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "pattern": {
    "kick": "array of integers",
    "snare": "array of integers",
    "percussion": "array of integers",
    "hihat_open": "array of integers",
    "hihat_closed": "array of integers"
  }
}
```

### Example

```json
{
  "id": "four_on_the_floor",
  "name": "Four on the Floor",
  "description": "Classic 4/4 house/techno beat with kick on each beat",
  "pattern": {
    "kick": [1, 5, 9, 13],
    "snare": [5, 13],
    "percussion": [],
    "hihat_open": [3, 7, 11, 15],
    "hihat_closed": [2, 4, 6, 8, 10, 12, 14, 16]
  }
}
```

---

## Velocity Profile

Defines how velocities are assigned in a pattern.

```json
{
  "kick": "integer (0-127)",
  "snare": "integer (0-127)",
  "percussion": "integer (0-127)",
  "hihat_open": "integer (0-127)",
  "hihat_closed": "integer (0-127)",
  "bass": "integer (0-127)"
}
```

### Example (Techno Profile)

```json
{
  "kick": 127,
  "snare": 110,
  "percussion": 84,
  "hihat_open": 100,
  "hihat_closed": 42,
  "bass": 110
}
```

---

## MIDI Event Stream

Internal representation during pattern transmission.

```
Timing (based on tempo):
  Beat duration = 60 / tempo (seconds)
  Step duration = Beat duration / 4 (16th-note resolution)

For each event (channel, note, velocity):
  1. Send MIDI Note On message (timestamp=0)
  2. Wait 90% of step duration
  3. Send MIDI Note Off message
  4. Wait 10% of step duration (buffer before next event)
  5. Repeat for next event

Total pattern duration ≈ num_events × step_duration
```

### Example Timing (128 BPM)

```
Beat duration = 60 / 128 = 0.46875 seconds
Step duration = 0.46875 / 4 = 0.1172 seconds

For 24 events:
  Total time ≈ 24 × 0.1172 ≈ 2.8 seconds
```

---

## Configuration Object

Application configuration (future use).

```json
{
  "midi": {
    "default_device": "string",
    "default_tempo": "integer",
    "note_on_velocity": "integer",
    "note_off_velocity": "integer"
  },
  "patterns": {
    "default_style": "string",
    "default_template": "string",
    "default_tempo": "integer"
  },
  "device": {
    "type": "string",
    "auto_detect": "boolean",
    "timeout_ms": "integer"
  }
}
```

### Example

```json
{
  "midi": {
    "default_device": "Akai Rhythm Wolf",
    "default_tempo": 128,
    "note_on_velocity": 100,
    "note_off_velocity": 0
  },
  "patterns": {
    "default_style": "techno",
    "default_template": "four_on_the_floor",
    "default_tempo": 128
  },
  "device": {
    "type": "rhythm_wolf",
    "auto_detect": true,
    "timeout_ms": 5000
  }
}
```

---

## Error Response Object

Returned by API on error conditions.

```json
{
  "error": "string (error code)",
  "message": "string (human-readable)",
  "code": "integer (HTTP status)",
  "timestamp": "ISO 8601 timestamp",
  "details": {
    "field": "string (optional)"
  }
}
```

### Example

```json
{
  "error": "invalid_device",
  "message": "MIDI device 'Unknown Device' not found on system",
  "code": 400,
  "timestamp": "2026-11-21T22:30:00Z",
  "details": {
    "device_name": "Unknown Device",
    "available_devices": ["Akai Rhythm Wolf", "IAC Driver Bus 1"]
  }
}
```

### Error Codes

| Error | HTTP | Meaning |
|-------|------|---------|
| `invalid_device` | 400 | Device name not found |
| `invalid_pattern` | 400 | Pattern structure malformed |
| `invalid_style` | 400 | Style not supported |
| `invalid_tempo` | 400 | Tempo out of range (20–300) |
| `device_timeout` | 503 | Device didn't respond |
| `device_disconnected` | 503 | Device unplugged during send |
| `internal_error` | 500 | Unexpected error |

---

## File Formats

### JSON Pattern File

```json
{
  "metadata": {
    "style": "techno",
    "tempo": 128,
    "template": "four_on_the_floor",
    "num_events": 24
  },
  "events": [
    {"channel": 10, "note": 36, "velocity": 127},
    {"channel": 10, "note": 44, "velocity": 42},
    ...
  ]
}
```

**File naming convention:**
```
pattern_{style}_{tempo}_{template}_{timestamp}.json
pattern_techno_128_4floor_1700599800.json
```

---

## Type Definitions (Python)

For reference in Python code:

```python
from typing import List, Dict, Tuple, Optional
from datetime import datetime

# MIDI event: (channel, note, velocity)
MIDIEvent = Tuple[int, int, int]

# Pattern structure
Pattern = Dict[str, any]

# Generate function signature
def generate_pattern(
    style: str = "techno",
    tempo: Optional[int] = None,
    template: str = "four_on_the_floor",
    include_bass: bool = False
) -> List[MIDIEvent]:
    ...

# Send function signature
def send_pattern(
    device_name: str,
    events: List[MIDIEvent],
    tempo: int = 128
) -> Dict[str, any]:
    ...
```

---

**Last Updated:** 2026-11-21
