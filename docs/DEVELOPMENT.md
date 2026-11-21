# Development Guide

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Python 3.10, `python-rtmidi`, `mido`
- Git
- Code editor (VS Code, PyCharm, etc.)

### Local Setup (Docker)

```bash
git clone https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre.git
cd Rythm-Wolf-Midi-PAtchre
git checkout dev

# Build the container
docker-compose build

# Test
make generate
make devices
```

### Local Setup (Native Python)

```bash
# Create venv
python3.10 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Test
python cli.py generate --help
python cli.py devices
```

---

## Project Structure

```
.
├── rhythm_wolf/
│   ├── __init__.py              # Package metadata
│   ├── mappings.py              # MIDI constants, styles, templates
│   ├── generator.py             # Pattern generation logic
│   └── sender.py                # MIDI output via mido
├── docs/
│   ├── TECHNICAL.md             # Architecture & design decisions
│   ├── API.yml                  # OpenAPI 3.0 specification
│   ├── DEVELOPMENT.md           # This file
│   └── SCHEMA.md                # Data structure definitions
├── cli.py                       # Main CLI entry (Click)
├── Dockerfile                   # Container definition
├── docker-compose.yml           # Compose config
├── Makefile                     # Shortcuts
├── requirements.txt             # Dependencies
├── README.md                    # User documentation
└── .gitignore
```

---

## Code Style & Quality

### Python Style

- **Formatter:** PEP 8 (use `black` or `autopep8` if linting)
- **Type hints:** Recommended but not enforced
- **Docstrings:** One-line for simple functions; multi-line for complex logic
- **Comments:** Explain WHY, not WHAT (code should be self-documenting)

### Examples

Good:
```python
def generate_pattern(style: str = "techno", tempo: int = 128) -> List[Tuple[int, int, int]]:
    """Generate MIDI events for a pattern."""
    # Kick on 1-5-9-13 for 4/4 groove
    events = [(10, 36, 127) for step in [1, 5, 9, 13]]
    return sorted(events)
```

Avoid:
```python
def gen_pat(s, t):  # Unclear abbreviations
    e = []  # Cryptic variable name
    for x in range(1, 14, 4):  # Magic numbers
        e.append((10, 36, 127))
    return e
```

### Testing

Currently no test suite. Recommended additions:

```bash
# Install test dependencies
pip install pytest pytest-cov

# Example test structure
tests/
├── test_mappings.py
├── test_generator.py
├── test_sender.py
└── conftest.py  # Fixtures
```

Test example:
```python
# tests/test_generator.py
from rhythm_wolf.generator import generate_pattern

def test_generate_techno():
    events = generate_pattern(style="techno", tempo=128)
    assert len(events) > 0
    assert all(ch in [1, 10] for ch, _, _ in events)
    assert all(42 <= vel <= 127 for _, _, vel in events)
```

---

## Common Development Tasks

### Add a New Style

1. Edit `rhythm_wolf/mappings.py`:

```python
TEMPO_RANGES = {
    "my_style": (120, 135),  # BPM range
    ...
}
```

2. Add a template if needed:

```python
PATTERNS = {
    "my_pattern": {
        "kick": [1, 5, 9, 13],
        "snare": [5, 13],
        "hihat_closed": [2, 4, 6, 8, 10, 12, 14, 16],
    },
}
```

3. Test:
```bash
make generate --style my_style --tempo 125
```

### Add a New MIDI Output Device

1. Update `rhythm_wolf/mappings.py` with new note assignments
2. Update `MIDI_CHANNELS` or `DRUM_NOTES` as needed
3. Update docs with new mappings
4. Test with hardware if available

### Add a CLI Command

1. Edit `cli.py`:

```python
@cli.command()
@click.option("--param", type=str, required=True)
@click.pass_context
def new_command(ctx, param):
    """Description of the command."""
    click.echo(f"Running with {param}")
```

2. Test:
```bash
docker-compose run --rm rhythm-wolf new-command --param value
```

### Update MIDI Mappings (from Device Manual)

1. Verify notes/channels from official Akai documentation
2. Update `rhythm_wolf/mappings.py`
3. Update `docs/TECHNICAL.md` reference table
4. Update `docs/API.yml` schema
5. Test with hardware
6. Document in commit message why mappings changed

---

## Debugging

### Generate & Inspect Patterns

```bash
# Save pattern to file
make generate --style techno > pattern.json

# Inspect with Python
python -c "
import json
with open('pattern.json') as f:
    p = json.load(f)
print(f'Events: {len(p[\"events\"])}')
print(f'Channels: {set(e[\"channel\"] for e in p[\"events\"])}')
print(f'Notes: {set(e[\"note\"] for e in p[\"events\"])}')
"
```

### Test MIDI Connectivity

```bash
# List devices
make devices

# Check if Rhythm Wolf shows up
docker-compose run --rm rhythm-wolf devices | grep -i "rhythm\|wolf"
```

### Enable Verbose Logging

Modify `rhythm_wolf/sender.py` to add debug output:

```python
def send_pattern(self, pattern, tempo=128):
    for i, (channel, note, velocity) in enumerate(pattern):
        print(f"Event {i}: CH{channel} Note{note} Vel{velocity}", file=sys.stderr)
        # ... send MIDI ...
```

---

## Git Workflow

### Branching

- `main`: Stable releases
- `dev`: Development (default branch)
- `feature/*`: Feature branches (branch from `dev`)

### Commits

```bash
# Feature work
git checkout -b feature/my-feature dev
git commit -m "feat: Add new feature"
git push origin feature/my-feature
# Open PR on GitHub

# Bug fixes
git checkout -b fix/my-bug dev
git commit -m "fix: Resolve issue #123"
git push origin fix/my-bug
# Open PR on GitHub

# Docs
git checkout -b docs/update-readme dev
git commit -m "docs: Update README with examples"
git push origin docs/update-readme
```

### Commit Message Format

```
type(scope): subject

Body (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code restructuring (no behavior change)
- `test`: Test additions
- `ci`: CI/CD pipeline changes

Examples:
```
feat(generator): Add breakbeat pattern template
fix(sender): Handle device disconnection gracefully
docs(api): Update OpenAPI spec for v0.2
```

---

## Release Process

1. Update version in `rhythm_wolf/__init__.py`
2. Update `CHANGELOG.md` (create if doesn't exist)
3. Commit: `git commit -m "bump: v0.2.0"`
4. Tag: `git tag -a v0.2.0 -m "Release v0.2.0"`
5. Push: `git push origin dev --tags`
6. Create GitHub Release with changelog

---

## Future Work

### High Priority

- [ ] Add pytest test suite
- [ ] CLI send with device auto-detection
- [ ] Pattern file I/O (save/load)
- [ ] Error handling for edge cases

### Medium Priority

- [ ] Web API (FastAPI backend)
- [ ] React frontend dashboard
- [ ] Pattern library/bank management
- [ ] Live pattern visualization

### Low Priority

- [ ] Swing/humanization options
- [ ] Pattern editor UI
- [ ] MIDI file importer
- [ ] Cloud sync for patterns

---

## Resources

- [Akai Rhythm Wolf User Guide](https://cdn.inmusicbrands.com/akai/attachments/wolf/Rhythm%20Wolf%20-%20User%20Guide%20-%20v1.3.pdf)
- [MIDI Specification](https://midimusic.github.io/tech/midispec.html)
- [mido Documentation](https://mido.readthedocs.io/)
- [Click CLI Framework](https://click.palletsprojects.com/)
- [Python Packaging Guide](https://packaging.python.org/)

---

## Questions or Issues?

Open an issue on [GitHub Issues](https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre/issues).

Happy coding! 🎵
