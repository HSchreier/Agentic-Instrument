"""Pattern library API routes."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from rhythm_wolf.library import PatternLibrary, PatternMetadata
from main import Pattern

router = APIRouter(prefix="/api/v1/library", tags=["library"])
library = PatternLibrary()


# Models
class SavePatternRequest(Pattern):
    """Request to save pattern."""
    name: str
    tags: Optional[List[str]] = None
    description: str = ""


class PatternItem(PatternMetadata):
    """Pattern item in library."""
    pass


# Routes

@router.post("/patterns", response_model=dict)
async def save_pattern(request: SavePatternRequest):
    """Save pattern to library."""
    try:
        pattern_id = library.save_pattern(
            pattern={
                "metadata": request.metadata.dict(),
                "events": [{"channel": e.channel, "note": e.note, "velocity": e.velocity}
                          for e in request.events],
            },
            name=request.name,
            style=request.metadata.style,
            template="four_on_the_floor",  # Default
            tags=request.tags,
            description=request.description,
        )

        return {
            "status": "success",
            "pattern_id": pattern_id,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/patterns", response_model=dict)
async def list_patterns(
    style: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    favorites_only: bool = Query(False),
):
    """List patterns from library."""
    try:
        patterns = library.list_patterns(
            style=style,
            tag=tag,
            search=search,
            favorites_only=favorites_only,
        )

        return {
            "patterns": [p.__dict__ for p in patterns],
            "total": len(patterns),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/patterns/{pattern_id}", response_model=dict)
async def get_pattern(pattern_id: str):
    """Get pattern from library."""
    pattern = library.get_pattern(pattern_id)
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")

    return pattern


@router.delete("/patterns/{pattern_id}")
async def delete_pattern(pattern_id: str):
    """Delete pattern from library."""
    if not library.delete_pattern(pattern_id):
        raise HTTPException(status_code=404, detail="Pattern not found")

    return {"status": "success", "deleted": pattern_id}


@router.post("/patterns/{pattern_id}/favorite")
async def toggle_favorite(pattern_id: str):
    """Toggle favorite status."""
    is_favorite = library.toggle_favorite(pattern_id)
    if is_favorite is False and pattern_id not in library.metadata_index:
        raise HTTPException(status_code=404, detail="Pattern not found")

    return {"status": "success", "favorite": is_favorite}


@router.post("/patterns/{pattern_id}/send")
async def quick_send(pattern_id: str, device: str):
    """Quick send pattern to device."""
    pattern = library.get_pattern(pattern_id)
    if not pattern:
        raise HTTPException(status_code=404, detail="Pattern not found")

    try:
        from rhythm_wolf.sender import MIDISender

        sender = MIDISender()
        if not sender.connect(device):
            raise HTTPException(status_code=503, detail="Failed to connect to device")

        # Convert and send
        events = [(e["channel"], e["note"], e["velocity"]) for e in pattern["events"]]
        sender.send_pattern(events, tempo=pattern["metadata"]["tempo"])
        sender.disconnect()

        # Increment play count
        library.increment_plays(pattern_id)

        return {
            "status": "success",
            "events_sent": len(events),
            "pattern_id": pattern_id,
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/patterns/{pattern_id}/duplicate")
async def duplicate_pattern(pattern_id: str, new_name: str):
    """Duplicate a pattern."""
    new_id = library.duplicate_pattern(pattern_id, new_name)
    if not new_id:
        raise HTTPException(status_code=404, detail="Pattern not found")

    return {
        "status": "success",
        "original_id": pattern_id,
        "new_id": new_id,
        "name": new_name,
    }


@router.get("/statistics", response_model=dict)
async def get_statistics():
    """Get library statistics."""
    return library.get_statistics()
