# Rhythm Wolf MIDI Export Toolkit

Generate and send MIDI drum patterns to your Akai Rhythm Wolf hardware—containerized and ready to go.

## Features

- **Generate patterns** in multiple styles (techno, house, tech house, minimal)
- **Send to hardware** via USB or 5-pin MIDI in real-time
- **Containerized** with all dependencies baked in—no version conflicts
- **CLI-based** for scripting and automation
- **Save patterns** as JSON for reuse

## Quick Start

### 1. Build the Docker image

```bash
docker-compose build
```

### 2. List MIDI devices

```bash
docker-compose run --rm rhythm-wolf devices
```

You should see your Rhythm Wolf listed.

### 3. Generate a pattern

```bash
docker-compose run --rm rhythm-wolf generate --style techno --tempo 128
```

Output is JSON showing channel, note, and velocity for each MIDI event.

### 4. Send to Rhythm Wolf

Connect your Rhythm Wolf via USB and run:

```bash
docker-compose run --rm -it rhythm-wolf send --style techno --tempo 128
```

**Important:** The tool will prompt you to:
1. Put the Rhythm Wolf into **Record Performance mode** (hold SHIFT + press Step 10)
2. Select a destination pattern on the device
3. Press Enter in the CLI to send the pattern

The device will quantize and record the incoming MIDI notes.

### 5. Save on device

After sending:
- Exit Record Performance on the device (press SHIFT + Step 10 again)
- Save the pattern: hold SHIFT + press Step 16 (SAVE)

## Usage

### Commands

```bash
# List available MIDI devices
docker-compose run --rm rhythm-wolf devices

# Generate pattern and print as JSON
docker-compose run --rm rhythm-wolf generate \
  --style techno \
  --tempo 128 \
  --template four_on_the_floor

# Save pattern to file
docker-compose run --rm rhythm-wolf generate \
  --style techno \
  --output patterns/techno_128.json

# Send a generated pattern to Rhythm Wolf
docker-compose run --rm -it rhythm-wolf send \
  --style house \
  --tempo 122

# Send a saved pattern from file
docker-compose run --rm -it rhythm-wolf send \
  --pattern-file patterns/techno_128.json

# Show style info
docker-compose run --rm rhythm-wolf info --style techno
```

### Options

#### `generate`
- `--style`: Music style (techno, house, tech_house, minimal). Default: techno
- `--tempo`: Tempo in BPM. If not set, uses recommended range for style
- `--template`: Pattern template (four_on_the_floor, half_time, minimal). Default: four_on_the_floor
- `--output`: Save to JSON file instead of stdout

#### `send`
- `--device`: MIDI device name. If not set, auto-detects Rhythm Wolf
- `--style`, `--tempo`, `--template`: Same as generate
- `--pattern-file`: Load pattern from JSON file instead of generating

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

## Example Workflow

```bash
# 1. Build once
docker-compose build

# 2. Check devices
docker-compose run --rm rhythm-wolf devices

# 3. Generate and save multiple patterns
docker-compose run --rm rhythm-wolf generate --style techno --output patterns/techno_138.json
docker-compose run --rm rhythm-wolf generate --style house --output patterns/house_122.json

# 4. Send pattern to device (interactive)
docker-compose run --rm -it rhythm-wolf send --pattern-file patterns/techno_138.json

# 5. Repeat step 4 for different patterns
```

## Architecture

```
cli.py                    # Main CLI entry point
│
├── rhythm_wolf/
│   ├── __init__.py
│   ├── mappings.py       # MIDI note/channel definitions
│   ├── generator.py      # Pattern generation logic
│   └── sender.py         # MIDI output handling
│
├── Dockerfile            # Container definition
├── docker-compose.yml    # Docker Compose config
└── requirements.txt      # Python dependencies
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

## References

- [Rhythm Wolf User Guide v1.3](./docs/Rhythm%20Wolf%20-%20User%20Guide%20-%20v1.3.pdf)
- [MIDI Specification](https://midimusic.github.io/tech/midispec.html)
- [mido - Python MIDI library](https://mido.readthedocs.io/)
