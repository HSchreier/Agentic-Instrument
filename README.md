# 🎹 Rhythm Wolf MIDI Export Toolkit

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-HSchreier%2FRythm--Wolf--Midi--PAtchre-blue?style=flat-square&logo=github)](https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://hub.docker.com)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Generate MIDI drum patterns with Claude. Send real-time beats to your Akai Rhythm Wolf.**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [CLI Commands](#-cli-commands)

</div>

---

## ✨ Features

🎵 **Generate patterns** in multiple styles (Techno, House, Tech House, Minimal)  
🎛️ **Send real-time MIDI** via USB or 5-pin MIDI—device quantizes automatically  
📦 **Fully containerized** with Docker—no version conflicts, works everywhere  
⚡ **CLI-first** design for scripting and automation  
💾 **Save & load** patterns as JSON for reuse  
🔄 **Claude-ready** (future: generate patterns from natural language)

## 🚀 Quick Start

### Prerequisites
- **Akai Rhythm Wolf** (powered on, USB or MIDI connected)
- **Docker Desktop** installed

### 1️⃣ Setup

```bash
# Clone & navigate
git clone https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre.git
cd Rythm-Wolf-Midi-PAtchre
git checkout dev

# Build the image
make build
```

### 2️⃣ Check Devices

```bash
make devices
```

Output:
```
Available MIDI output devices:
  1. Akai Rhythm Wolf
  2. IAC Driver Bus 1
```

### 3️⃣ Generate a Pattern

```bash
make generate
```

Returns JSON:
```json
{
  "metadata": {
    "style": "techno",
    "tempo": 128,
    "num_events": 24
  },
  "events": [
    {"channel": 10, "note": 36, "velocity": 127},
    ...
  ]
}
```

### 4️⃣ Send to Device

```bash
make send
```

Then:
1. **On the Rhythm Wolf:** Hold SHIFT + press Step 10 (enters Record Performance mode)
2. **In the CLI:** Press Enter
3. **Watch:** Device quantizes and records MIDI in real-time
4. **Save:** Hold SHIFT + press Step 16 (SAVE) on the device

✅ Pattern saved to internal memory!

## 🎼 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User Request                                              │
│  "Send me a 128 BPM techno pattern"                        │
│           ↓                                                 │
│  ┌───────────────────────────────────────┐                │
│  │ CLI: make send --style techno         │                │
│  │ (runs in Docker container)            │                │
│  └─────────────┬───────────────────────┘                 │
│                ↓                                            │
│  ┌────────────────────────────┐                           │
│  │ Generator creates MIDI     │                           │
│  │ Kick, Snare, Hats, etc.    │                           │
│  └─────────────┬──────────────┘                           │
│                ↓                                            │
│  ┌────────────────────────────────────┐                  │
│  │ Sends via USB in real-time:        │                  │
│  │ Note On  (channel 10, note 36)    │                  │
│  │ Note Off (after short duration)    │                  │
│  │ ... (repeat for all events)        │                  │
│  └─────────────┬─────────────────────┘                  │
│                ↓                                            │
│  ┌────────────────────────────────────┐                  │
│  │ Rhythm Wolf (Record Performance)   │                  │
│  │ • Receives MIDI notes              │                  │
│  │ • Quantizes to 16-step grid        │                  │
│  │ • Records to selected pattern      │                  │
│  └────────────────────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📖 Usage

### Available Commands

#### `make devices`
List available MIDI output devices. Auto-detects Rhythm Wolf.
```bash
$ make devices
Available MIDI output devices:
  1. Akai Rhythm Wolf  <- Rhythm Wolf
  2. IAC Driver Bus 1
```

#### `make generate` / `generate-file`
Generate a pattern and display or save as JSON.
```bash
$ make generate --style house --tempo 122
$ make generate-file                        # Saves to patterns/

# Full CLI usage
docker-compose run --rm rhythm-wolf generate \
  --style techno \
  --tempo 128 \
  --template four_on_the_floor \
  --output pattern.json
```

#### `make send`
Send pattern to Rhythm Wolf (interactive).
```bash
$ make send --style techno

⚠️  Make sure Rhythm Wolf is in Record Performance mode!
Press Enter to send pattern...
✓ Pattern sent!
Save it on the Rhythm Wolf: hold SHIFT + press Step 16 (SAVE)
```

#### `make info`
Show style details.
```bash
$ make info --style techno
TECHNO
  Tempo range: 128–140 BPM
```

### CLI Options

| Command | Option | Type | Default | Description |
|---------|--------|------|---------|-------------|
| `generate` | `--style` | techno\|house\|tech_house\|minimal | techno | Music genre |
| `generate` | `--tempo` | integer | auto | BPM (auto-picks if not set) |
| `generate` | `--template` | four_on_the_floor\|half_time\|minimal | four_on_the_floor | Rhythm pattern |
| `generate` | `--output` | file path | stdout | Save to JSON file |
| `send` | `--device` | device name | auto-detect | MIDI device to target |
| `send` | `--pattern-file` | file path | - | Load pattern from JSON |

## MIDI Specifications

### Channels & Notes

| Sound | Channel | Note | Name |
|-------|---------|------|------|
| Kick | 10 | 36 | C2 |
| Snare | 10 | 38 | D2 |
| Percussion | 10 | 40 | E2 |
| Hi-hat open | 10 | 42 | F#2 |
| Hi-hat closed | 10 | 44 | G#2 |
| Bass synth | 1 | 36+ | C2+ |

### Velocity Levels

- **42**: Soft / low
- **84**: Medium
- **127**: Accent / high

## Pattern Templates

### four_on_the_floor
Classic 4/4 house/techno beat:
- Kick on steps 1, 5, 9, 13
- Snare on steps 5, 13
- Closed hats on even 16th notes

### half_time
Slower, spacier feel:
- Kick on steps 1, 9
- Snare on steps 5, 13
- Closed hats on selected steps

### minimal
Hypnotic, minimalist:
- Kick on steps 1, 5, 9, 13
- Snare on step 5 only
- Hats on steps 3, 7, 11, 15

## 📋 Example Workflows

### Workflow 1: Quick Send (Generate & Send)

```bash
# 1. Build the image
make build

# 2. Check if Rhythm Wolf is connected
make devices

# 3. Send a generated pattern
make send --style techno --tempo 128

# On Rhythm Wolf:
#   - Hold SHIFT + press Step 10 (Record Performance)
#   - Press Enter in CLI to send
#   - Hold SHIFT + press Step 16 to save
```

### Workflow 2: Batch Generate & Save

```bash
# Generate multiple patterns and save to files
make generate-file --style techno --tempo 128
make generate-file --style house --tempo 122
make generate-file --style minimal --tempo 130

# Then send any saved pattern
docker-compose run --rm -it rhythm-wolf send \
  --pattern-file patterns/pattern_1234567890.json
```

### Workflow 3: Script Multiple Sends

```bash
#!/bin/bash
# Generate and send 4 patterns to slots 1-4

for style in techno house tech_house minimal; do
  docker-compose run --rm -it rhythm-wolf send --style $style
  sleep 2  # Pause for saving
done
```

## 🏗️ Architecture

### Project Structure

```
midi-playground/
├── cli.py                        # Click-based CLI entrypoint
├── rhythm_wolf/
│   ├── __init__.py              # Package init
│   ├── mappings.py              # MIDI channels, notes, velocities
│   ├── generator.py             # Pattern generation engine
│   └── sender.py                # Real-time MIDI output via mido
├── Dockerfile                   # Python 3.10 + mido + python-rtmidi
├── docker-compose.yml           # Compose config (volumes, TTY)
├── requirements.txt             # Pinned dependencies
├── Makefile                     # Convenient shortcuts
├── .gitignore
└── README.md (this file)
```

### Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User (CLI)                                             │
│  $ make send --style techno                             │
└────────────────┬─────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │   cli.py        │
        │  (Click CLI)    │
        └────────┬────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
┌────▼────────┐    ┌────────▼──────┐
│ generator   │    │    sender      │
│  Creates    │    │  Sends MIDI    │
│  MIDI notes │    │  to device     │
└────┬────────┘    └────────┬───────┘
     │                      │
     └──────────┬───────────┘
                │
        ┌───────▼─────────────────┐
        │  mappings.py            │
        │ (note/channel defs)     │
        └────────────────────────┘
                │
                │ (MIDI via mido)
                │
        ┌───────▼─────────────────┐
        │  Rhythm Wolf (USB)      │
        │  Record Performance     │
        │  Quantize & Store       │
        └───────────────────────────┘
```

## Troubleshooting

### "No MIDI devices found"

**On macOS:**
- Ensure Rhythm Wolf is powered on and connected via USB
- Check System Preferences → Sound → MIDI Devices
- Restart Docker Desktop if needed

**On Linux:**
- Mount ALSA devices: uncomment the `devices` section in docker-compose.yml
- Ensure ALSA is installed: `apt-get install alsa-utils`

### Device doesn't record notes

1. Verify the device is in Record Performance mode (Step 10 button indicator shows REC)
2. Check that the correct pattern is selected
3. Try sending a simple test pattern first
4. Verify MIDI output is routed to the Rhythm Wolf in your OS settings

### Pattern doesn't sound right

- Check that velocities are within [42, 84, 127]
- Verify MIDI channels match (10 for drums, 1 for bass)
- Ensure notes are valid (kick=36, snare=38, etc.)
- Use the JSON output to inspect generated patterns

## Advanced: Extending the Tool

### Add a new style

Edit `rhythm_wolf/mappings.py`:

```python
TEMPO_RANGES = {
    "my_style": (120, 135),  # BPM range
    ...
}

PATTERNS = {
    "my_pattern": {
        "kick": [1, 5, 9, 13],
        "snare": [5, 13],
        ...
    },
}
```

### Generate patterns with Claude

Create a wrapper that calls the Anthropic API:

```python
import anthropic
import json
from rhythm_wolf.sender import MIDISender
from rhythm_wolf.generator import events_to_json

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-opus-5",
    messages=[{
        "role": "user",
        "content": "Generate a 128 BPM techno drum pattern in MIDI format"
    }]
)

# Parse Claude's output and send to device
```

## License

MIT

## 🗂️ Styles & Templates

### Music Styles

| Style | Tempo | Vibe | Good For |
|-------|-------|------|----------|
| **Deep House** | 118–126 BPM | Groovy, soulful | DJ sets, lounge |
| **Tech House** | 124–130 BPM | Hypnotic, rhythmic | Dance floor, peak hours |
| **Techno** | 128–140 BPM | Driving, industrial | Warehouse, production |
| **Minimal** | 120–135 BPM | Sparse, hypnotic | Background, ambient |

### Rhythm Templates

- **four_on_the_floor**: Classic 4/4 kick on 1-5-9-13
- **half_time**: Spacious kick on 1-9
- **minimal**: Hypnotic sparse kick

---

## 🤝 Contributing

Contributions welcome! Ideas:

- [ ] Claude Skill integration (generate patterns from chat)
- [ ] Web UI wrapper
- [ ] More rhythm templates
- [ ] Pattern library
- [ ] MIDI file importer
- [ ] Live visual feedback
- [ ] Preset manager

**To contribute:**
1. Fork the repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit changes (`git commit -m "Add my feature"`)
4. Push (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 🗺️ Roadmap

- [x] Basic CLI pattern generation
- [x] MIDI sender (USB/5-pin)
- [x] Docker containerization
- [x] Documentation
- [ ] Claude Skill for natural language patterns
- [ ] Web UI dashboard
- [ ] Preset manager (save/load pattern banks)
- [ ] Pattern visualizer
- [ ] Live BPM sync detection
- [ ] Swing/humanization options

---

## 🐛 Troubleshooting

### "No MIDI devices found"

**macOS:**
```bash
# Check System Preferences > Sound > MIDI Devices
# Ensure Rhythm Wolf is powered on and connected via USB
# Try restarting Docker Desktop
```

**Linux:**
```bash
# Uncomment devices section in docker-compose.yml
# Install ALSA: sudo apt-get install alsa-utils
```

### Device doesn't record

1. ✅ Verify Rhythm Wolf is in Record Performance mode (Step 10 button lit)
2. ✅ Check MIDI device is correctly selected
3. ✅ Try a simple test pattern first
4. ✅ Check velocities are in range (42, 84, 127)

### Wrong tempo

The tool respects your BPM setting. Verify:
```bash
# Check generated pattern
make generate --style techno --tempo 130
```

---

## 📚 References

- [Akai Rhythm Wolf User Guide v1.3](https://cdn.inmusicbrands.com/akai/attachments/wolf/Rhythm%20Wolf%20-%20User%20Guide%20-%20v1.3.pdf)
- [MIDI Specification](https://midimusic.github.io/tech/midispec.html)
- [mido – Python MIDI library](https://mido.readthedocs.io/)
- [python-rtmidi](https://python-rtmidi.readthedocs.io/)

---

## 📄 License

MIT License – See [LICENSE](LICENSE) for details.

---

## 🎵 Made with ❤️ for Rhythm Wolf users

Questions? Open an issue on [GitHub](https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre/issues).
