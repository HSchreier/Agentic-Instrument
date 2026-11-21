"""Pattern generator for Rhythm Wolf."""

from typing import List, Tuple
from .mappings import (
    DRUM_CHANNEL, SYNTH_CHANNEL,
    DRUM_NOTES, VELOCITIES,
    get_pattern_template, get_tempo_for_style
)


def generate_pattern(style: str = "techno", tempo: int = 128,
                     template: str = "four_on_the_floor",
                     include_bass: bool = False) -> List[Tuple[int, int, int]]:
    """Generate a MIDI pattern for Rhythm Wolf.

    Args:
        style: Music style (techno, house, tech_house, minimal)
        tempo: Tempo in BPM
        template: Pattern template name
        include_bass: Whether to include bass synth notes

    Returns:
        List of (channel, note, velocity) tuples
    """
    if not tempo:
        tempo = get_tempo_for_style(style)

    # Get pattern template
    pattern = get_pattern_template(template)
    events = []

    # Build drum pattern
    for sound, steps in pattern.items():
        if sound not in DRUM_NOTES:
            continue

        note = DRUM_NOTES[sound]
        for step in steps:
            # Determine velocity based on sound and step
            if sound == "snare":
                velocity = VELOCITIES["accent"]
            elif sound == "kick":
                velocity = VELOCITIES["accent"]
            elif sound == "hihat_closed":
                # Vary velocity for swing
                velocity = VELOCITIES["soft"] if step % 2 == 0 else VELOCITIES["medium"]
            else:
                velocity = VELOCITIES["medium"]

            events.append((DRUM_CHANNEL, note, velocity))

    # Sort by step (implicit in the order sent)
    events.sort()

    # Add optional bass synth
    if include_bass:
        bass_pattern = [1, 5, 9, 13]  # Four-on-the-floor
        bass_note = 36  # C2
        for step in bass_pattern:
            events.append((SYNTH_CHANNEL, bass_note, VELOCITIES["medium"]))

    return events


def events_to_json(events: List[Tuple[int, int, int]], style: str = "techno",
                   tempo: int = 128) -> dict:
    """Convert events to JSON-serializable format.

    Args:
        events: List of (channel, note, velocity) tuples
        style: Music style name
        tempo: Tempo in BPM

    Returns:
        Dictionary with pattern metadata
    """
    return {
        "metadata": {
            "style": style,
            "tempo": tempo,
            "num_events": len(events),
        },
        "events": [
            {"channel": ch, "note": note, "velocity": vel}
            for ch, note, vel in events
        ]
    }
