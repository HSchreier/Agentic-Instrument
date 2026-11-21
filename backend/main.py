"""FastAPI backend for Rhythm Wolf MIDI Export Toolkit."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sys

# Add parent directory to path so we can import rhythm_wolf
sys.path.insert(0, str(Path(__file__).parent.parent))

from rhythm_wolf.sender import MIDISender
from rhythm_wolf.generator import generate_pattern, events_to_json
from rhythm_wolf.mappings import TEMPO_RANGES, PATTERNS, DRUM_NOTES, VELOCITIES

from pydantic import BaseModel
from typing import Optional, List

# Import routers (optional - chat requires anthropic)
try:
    from chat_routes import router as chat_router
    CHAT_AVAILABLE = True
except (ImportError, Exception):
    chat_router = None
    CHAT_AVAILABLE = False

app = FastAPI(
    title="Rhythm Wolf MIDI API",
    description="Generate and send MIDI patterns to Akai Rhythm Wolf",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers (optional)
if CHAT_AVAILABLE and chat_router:
    app.include_router(chat_router)

# Models
class MIDIEvent(BaseModel):
    channel: int
    note: int
    velocity: int


class PatternMetadata(BaseModel):
    style: str
    tempo: int
    num_events: int


class Pattern(BaseModel):
    metadata: PatternMetadata
    events: List[MIDIEvent]


class GenerateRequest(BaseModel):
    style: str = "techno"
    tempo: Optional[int] = None
    template: str = "four_on_the_floor"
    include_bass: bool = False


class SendRequest(BaseModel):
    device: str
    pattern: Pattern


# Routes

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/v1/devices")
async def list_devices():
    """List available MIDI output devices."""
    sender = MIDISender()
    devices = sender.list_devices()
    return {"devices": devices}


@app.post("/api/v1/patterns/generate")
async def generate(request: GenerateRequest):
    """Generate a MIDI pattern."""
    try:
        tempo = request.tempo or next(
            (start + end) // 2 for k, (start, end) in TEMPO_RANGES.items() if k == request.style
        )

        events = generate_pattern(
            style=request.style,
            tempo=tempo,
            template=request.template,
            include_bass=request.include_bass,
        )

        pattern_dict = events_to_json(events, style=request.style, tempo=tempo)

        return Pattern(
            metadata=PatternMetadata(
                style=pattern_dict["metadata"]["style"],
                tempo=pattern_dict["metadata"]["tempo"],
                num_events=pattern_dict["metadata"]["num_events"],
            ),
            events=[MIDIEvent(**e) for e in pattern_dict["events"]],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/patterns/send")
async def send(request: SendRequest):
    """Send pattern to Rhythm Wolf."""
    try:
        sender = MIDISender()

        if not sender.connect(request.device):
            raise HTTPException(status_code=503, detail="Failed to connect to device")

        # Convert pattern to events
        events = [(e.channel, e.note, e.velocity) for e in request.pattern.events]

        sender.send_pattern(events, tempo=request.pattern.metadata.tempo)
        sender.disconnect()

        return {
            "status": "success",
            "events_sent": len(events),
            "duration_ms": int((len(events) * 60.0 / request.pattern.metadata.tempo / 4) * 1000),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@app.get("/api/v1/info/styles")
async def list_styles():
    """List available music styles."""
    styles = [
        {"id": "techno", "name": "Techno", "tempo_min": 128, "tempo_max": 140},
        {"id": "house", "name": "House", "tempo_min": 118, "tempo_max": 126},
        {"id": "tech_house", "name": "Tech House", "tempo_min": 124, "tempo_max": 130},
        {"id": "minimal", "name": "Minimal", "tempo_min": 120, "tempo_max": 135},
    ]
    return {"styles": styles}


@app.get("/api/v1/info/templates")
async def list_templates():
    """List available pattern templates."""
    templates = [
        {"id": "four_on_the_floor", "name": "Four on the Floor", "description": "Classic 4/4 beat"},
        {"id": "half_time", "name": "Half Time", "description": "Spacious, slower feel"},
        {"id": "minimal", "name": "Minimal", "description": "Hypnotic, sparse pattern"},
    ]
    return {"templates": templates}


@app.get("/api/v1/info/mappings")
async def get_mappings():
    """Get MIDI note and channel mappings."""
    return {
        "channels": {"drums": 10, "synth": 1},
        "drum_notes": {name: note for name, note in DRUM_NOTES.items()},
        "velocities": VELOCITIES,
    }


@app.get("/api/v1/library/presets")
async def get_presets():
    """Get all preset patterns from JSON."""
    import json
    from pathlib import Path

    presets_path = Path(__file__).parent.parent / "patterns" / "presets" / "standard_patterns.json"

    if not presets_path.exists():
        return {"presets": [], "total": 0}

    try:
        with open(presets_path, 'r') as f:
            data = json.load(f)
        return {
            "presets": data.get("patterns", []),
            "total": len(data.get("patterns", []))
        }
    except Exception as e:
        return {"presets": [], "total": 0, "error": str(e)}


# Serve React frontend
frontend_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
