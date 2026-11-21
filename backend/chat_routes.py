"""Chat interface routes for Claude-powered pattern generation."""

import sys
import json
import os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    anthropic = None

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from main import Pattern, MIDIEvent, PatternMetadata
from rhythm_wolf.generator import generate_pattern

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Initialize Anthropic client (optional)
client = None
if ANTHROPIC_AVAILABLE:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        client = anthropic.Anthropic(api_key=api_key)

SYSTEM_PROMPT = """You are an AI assistant for the Rhythm Wolf MIDI pattern generator.
Users describe drum patterns, and you help them create, save, and manage MIDI patterns
for their Akai Rhythm Wolf hardware synthesizer.

When a user asks to generate a pattern, extract these parameters:
- style: one of "techno", "house", "tech_house", "minimal" (default: techno)
- tempo: BPM number between 60-300 (default: auto-pick based on style)
- template: one of "four_on_the_floor", "half_time", "minimal" (default: four_on_the_floor)
- include_bass: true/false (default: false)

Always respond with a friendly message PLUS a JSON action block like this:

{
  "intent": "generate",
  "parameters": {
    "style": "techno",
    "tempo": 128,
    "template": "four_on_the_floor",
    "include_bass": false
  }
}

If the user asks to save, delete, search, or manage patterns (future phases),
respond with intent="save", intent="delete", etc., with appropriate parameters.

For now, focus on pattern generation. Be conversational and helpful."""


class ChatMessage(BaseModel):
    """Chat message from user."""
    message: str
    conversationId: Optional[str] = None


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    id: str
    content: str
    intent: str
    parameters: dict
    pattern: Optional[Pattern] = None
    suggestedActions: List[dict] = []


@router.post("/message", response_model=ChatResponse)
async def chat_message(request: ChatMessage):
    """Process chat message and generate pattern if requested."""

    if not client or not ANTHROPIC_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Claude API not configured. Set ANTHROPIC_API_KEY environment variable."
        )

    try:
        # Call Claude API
        response = client.messages.create(
            model="claude-opus-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )

        # Extract Claude's response
        claude_text = response.content[0].text

        # Try to parse JSON action from response
        intent = None
        parameters = {}
        pattern_obj = None

        # Look for JSON block in response
        try:
            # Find JSON in the response
            start = claude_text.rfind('{')
            end = claude_text.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = claude_text[start:end]
                action_data = json.loads(json_str)
                intent = action_data.get("intent", "unknown")
                parameters = action_data.get("parameters", {})
        except (json.JSONDecodeError, ValueError):
            # No valid JSON found, just use the text
            intent = "unknown"

        # If intent is generate, create the pattern
        if intent == "generate":
            try:
                pattern_obj = generate_pattern(
                    style=parameters.get("style", "techno"),
                    tempo=parameters.get("tempo"),
                    template=parameters.get("template", "four_on_the_floor"),
                    include_bass=parameters.get("include_bass", False)
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Pattern generation failed: {str(e)}"
                )

        # Suggested actions based on intent
        suggested_actions = []
        if intent == "generate" and pattern_obj:
            suggested_actions = [
                {"label": "Save to Library", "action": "save"},
                {"label": "Send to Device", "action": "send"},
                {"label": "Create Variation", "action": "duplicate"}
            ]

        return ChatResponse(
            id=f"msg_{response.id}",
            content=claude_text,
            intent=intent,
            parameters=parameters,
            pattern=pattern_obj,
            suggestedActions=suggested_actions
        )

    except anthropic.APIError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Claude API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat error: {str(e)}"
        )
