# Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [MIDI Implementation](#midi-implementation)
4. [Design Decisions](#design-decisions)
5. [API Specification](#api-specification)
6. [Development](#development)
7. [Future Considerations](#future-considerations)

---

## Overview

Rhythm Wolf MIDI Export Toolkit is a containerized Python application that generates MIDI drum patterns and sends them in real-time to an Akai Rhythm Wolf drum machine. The tool bridges the gap between pattern generation (potentially powered by Claude) and hardware recording.

### Core Principle

**Real-time MIDI transmission, not file import.** The Rhythm Wolf does not support bulk MIDI file import. Instead, we send MIDI note events in real-time while the device is in Record Performance mode, where it quantizes incoming notes to its internal 16-step sequencer and stores them in pattern memory.

---

## Architecture

### High-Level Flow

```
User Request
    ↓
CLI Parser (Click)
    ↓
Generator (create MIDI note data)
    ├── Pattern Template (4-on-floor, half-time, minimal)
    ├── Style (techno, house, etc.)
    └── Tempo & velocities
    ↓
Sender (mido - MIDI output)
    ├── Connect to device
    ├── Send Note On/Off events
    └── Timing control
    ↓
Rhythm Wolf (Record Performance)
    ├── Receive MIDI on channels 10 (drums) or 1 (synth)
    ├── Quantize to step grid
    └── Store in pattern memory
```

### Module Breakdown

#### `cli.py` (Entry Point)
- **Framework:** Click (Python CLI framework)
- **Responsibilities:**
  - Parse command-line arguments
  - Dispatch to generator or sender
  - Handle I/O (stdout, files, TTY)
  - User feedback and error messages

#### `rhythm_wolf/mappings.py` (Constants & Config)
- **MIDI Channels:**
  - Channel 10: Drums (Kick, Snare, Percussion, Hi-hat open/closed)
  - Channel 1: Bass synth
- **MIDI Notes** (per Akai official documentation)
  - Kick: 36
  - Snare: 38
  - Percussion: 40
  - Hi-hat open: 42
  - Hi-hat closed: 44
  - Bass synth: 36+ (C2 onwards, 3-octave range)
- **Velocity Levels:**
  - 42: Soft/low
  - 84: Medium
  - 127: Accent/high
- **Tempo Ranges:** Recommended BPM for each style
- **Pattern Templates:** Pre-defined step sequences

#### `rhythm_wolf/generator.py` (Pattern Creation)
- **Function:** `generate_pattern()`
  - **Input:** style, tempo, template, include_bass
  - **Output:** List of (channel, note, velocity) tuples
  - **Logic:**
    - Load pattern template (which steps have drums)
    - Assign MIDI notes to each drum sound
    - Determine velocities (variation for swing)
    - Return event list sorted by step
- **Function:** `events_to_json()`
  - Converts event tuples to JSON-serializable format
  - Includes metadata (style, tempo, event count)

#### `rhythm_wolf/sender.py` (MIDI Output)
- **Class:** `MIDISender`
  - **Responsibility:** Manage MIDI device connection and transmission
  - **Methods:**
    - `list_devices()`: Query system for available MIDI outputs
    - `connect(device_name)`: Open MIDI output port
    - `send_pattern(pattern, tempo)`: Transmit events in real-time
    - `disconnect()`: Close port gracefully
  - **Timing:**
    - Calculates beat duration from tempo: `60.0 / tempo`
    - 16th-note step duration: `beat_duration / 4`
    - Sends Note On, waits 90% of step, sends Note Off, waits 10%
- **Library:** `mido` (pure Python MIDI library)
  - Automatically finds available MIDI ports (platform-agnostic)
  - No external binary dependencies

---

## MIDI Implementation

### Channels & Notes Reference

| Sound | Channel | Note | Octave (scientific) |
|-------|---------|------|---------------------|
| Kick | 10 | 36 | C2 |
| Snare | 10 | 38 | D2 |
| Percussion | 10 | 40 | E2 |
| Hi-hat open | 10 | 42 | F#2 |
| Hi-hat closed | 10 | 44 | G#2 |
| Bass synth | 1 | 36–60 | C2–C4 |

**Important:** MIDI note numbers are the authoritative reference, not octave names (which vary by DAW).

### Message Format

Each MIDI event is transmitted as:

```
Note On Message:
  - Status: 0x90 (Note On, channel 0–9 internally)
  - Channel: 10 (drums) or 1 (synth) [converted to 0-indexed]
  - Note: 36–44 (drums) or 36–60 (synth)
  - Velocity: 42, 84, or 127

Delay: ~100ms (16th-note at typical tempo)

Note Off Message:
  - Status: 0x80 (Note Off, same channel)
  - Note: (same as Note On)
  - Velocity: 0
```

### Record Performance Mode

**Device state required:** Rhythm Wolf in "Record Performance mode"
- **Entry:** Hold SHIFT + press Step 10 (REC PERF)
- **Indication:** Step 10 indicator flashes red
- **Behavior:** All incoming MIDI notes are quantized and overdubbed onto the selected sequence
- **Exit:** Press SHIFT + Step 10 again or use Rec Off button
- **Save:** Hold SHIFT + press Step 16 (SAVE)

---

## Design Decisions

### 1. Why Real-Time Transmission Instead of File Import?

**Decision:** Transmit MIDI events in real-time, not bulk file import.

**Rationale:**
- Akai Rhythm Wolf does not expose a file import API
- The device's native workflow is live MIDI recording with quantization
- Real-time streaming is more flexible for future Claude integration
- Quantization is handled by the hardware, ensuring accuracy

### 2. Why Containerize?

**Decision:** Docker + docker-compose for all distribution.

**Rationale:**
- Eliminates "works on my machine" issues
- Python 3.10 is pinned; no surprise compatibility breaks
- MIDI library dependencies (python-rtmidi) are pre-compiled
- Cross-platform (macOS, Linux, Windows with WSL2)
- Future web service deployment is straightforward

### 3. Why CLI-First?

**Decision:** Click-based CLI, no GUI initially.

**Rationale:**
- Fast to build and test
- Composable with other tools (bash scripts, CI/CD)
- Lower surface area for bugs
- Web UI can wrap the CLI layer later

### 4. Why Three Velocity Levels?

**Decision:** Only use 42, 84, 127 (device limitation).

**Rationale:**
- Rhythm Wolf responds to only three musical velocity levels
- Values outside this range are snapped to nearest
- Aligns with hardware's pad velocity controls

### 5. Why Separate Generator & Sender?

**Decision:** Split pattern creation from MIDI transmission.

**Rationale:**
- Generator output (JSON) is reusable independently
- Enables offline pattern design (no device connected)
- Future Claude skill can call generator only
- Web UI can preview patterns before sending

---

## API Specification

See [API.yml](./API.yml) for full OpenAPI 3.0 specification.

### Quick Reference

#### `GET /devices`
List available MIDI output devices.

**Response:**
```json
{
  "devices": [
    "Akai Rhythm Wolf",
    "IAC Driver Bus 1"
  ]
}
```

#### `POST /patterns/generate`
Generate a MIDI pattern.

**Request Body:**
```json
{
  "style": "techno",
  "tempo": 128,
  "template": "four_on_the_floor",
  "include_bass": false
}
```

**Response:**
```json
{
  "metadata": {
    "style": "techno",
    "tempo": 128,
    "num_events": 24
  },
  "events": [
    {"channel": 10, "note": 36, "velocity": 127},
    {"channel": 10, "note": 44, "velocity": 42}
  ]
}
```

#### `POST /patterns/send`
Send pattern to Rhythm Wolf in real-time.

**Request Body:**
```json
{
  "device": "Akai Rhythm Wolf",
  "pattern": {
    "metadata": {...},
    "events": [...]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "events_sent": 24,
  "duration_ms": 2400
}
```

---

## Development

### Environment Setup

```bash
# Clone & enter directory
git clone https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre.git
cd Rythm-Wolf-Midi-PAtchre
git checkout dev

# Option 1: Docker (recommended)
make build
make generate

# Option 2: Local (requires Python 3.10 + mido)
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python cli.py generate --help
```

### Adding a New Style

1. Edit `rhythm_wolf/mappings.py`:
   ```python
   TEMPO_RANGES["my_style"] = (120, 135)
   ```

2. Add a pattern template:
   ```python
   PATTERNS["my_pattern"] = {
       "kick": [1, 5, 9, 13],
       "snare": [5, 13],
       "hihat_closed": [2, 4, 6, 8, 10, 12, 14, 16]
   }
   ```

3. Test:
   ```bash
   make generate --style my_style
   ```

### Adding a New Command

1. Edit `cli.py`:
   ```python
   @cli.command()
   @click.option("--param", type=str, default="value")
   def new_command(param):
       """Description of command."""
       click.echo(f"Running with {param}")
   ```

2. Test:
   ```bash
   docker-compose run --rm rhythm-wolf new-command --param test
   ```

### Testing Pattern Generation

```bash
# Generate and inspect JSON
make generate --style techno > pattern.json
cat pattern.json | jq '.events | length'  # Count events

# Generate multiple styles
for style in techno house minimal; do
  echo "=== $style ==="
  make generate --style $style | jq '.metadata'
done
```

### Debugging MIDI

```bash
# List connected MIDI devices
make devices

# Generate pattern and inspect
make generate --style techno --output debug.json
python -c "import json; p = json.load(open('debug.json')); print(f'Events: {len(p[\"events\"])}')"

# Verbose CLI output
docker-compose run --rm rhythm-wolf send --device "Your Device" -vvv 2>&1
```

---

## Future Considerations

### 1. Claude Skill Integration

**Goal:** "Generate a 128 BPM techno beat" → Claude generates pattern → send to device.

**Implementation:**
- Skill wraps `generate_pattern()` function
- Returns pattern JSON
- User confirms and runs `send` command
- Or: Auto-send via API

### 2. Web Service & Dashboard

**Goal:** Browser-based UI for pattern generation and sending.

**Components:**
- FastAPI or Flask backend (wraps CLI logic)
- React frontend (live pattern preview, device selector)
- WebMIDI API for browser-to-device transmission
- Optional: Real-time pattern visualization (audio-reactive)

### 3. Preset Library & Management

**Goal:** Save/organize pattern banks locally or in cloud.

**Schema:**
```json
{
  "bank": {
    "name": "My Techno Patterns",
    "patterns": [
      {"id": "p1", "style": "techno", "tempo": 128, "template": "4-floor", "data": {...}},
      {"id": "p2", "style": "techno", "tempo": 130, "template": "half-time", "data": {...}}
    ]
  }
}
```

### 4. Live Pattern Visualization

**Goal:** See which steps are active while pattern plays.

**Technology:**
- SVG or Canvas visualization
- Sync to actual playback tempo
- Audio feedback (click track)

### 5. Swing & Humanization

**Goal:** Add groove and variation to patterns.

**Features:**
- Offset certain steps by ±10ms (swing)
- Vary velocities slightly (humanize)
- Random fills

### 6. Pattern Editor UI

**Goal:** Visually edit MIDI patterns before sending.

**Features:**
- Grid-based step editor
- Drag-and-drop velocity control
- Note assignment per step

---

## Resources

- [Akai Rhythm Wolf User Guide v1.3](https://cdn.inmusicbrands.com/akai/attachments/wolf/Rhythm%20Wolf%20-%20User%20Guide%20-%20v1.3.pdf)
- [MIDI Specification](https://midimusic.github.io/tech/midispec.html)
- [mido Documentation](https://mido.readthedocs.io/)
- [Click CLI Framework](https://click.palletsprojects.com/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)

---

**Last Updated:** 2026-11-21  
**Author:** Helmut Schreier + Claude  
**License:** MIT
