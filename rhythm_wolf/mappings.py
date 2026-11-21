"""MIDI note and channel mappings for Akai Rhythm Wolf."""

# MIDI channels
DRUM_CHANNEL = 10
SYNTH_CHANNEL = 1

# MIDI note assignments for drums (channel 10)
DRUM_NOTES = {
    "kick": 36,
    "snare": 38,
    "percussion": 40,
    "hihat_open": 42,
    "hihat_closed": 44,
}

# Velocity levels
VELOCITIES = {
    "soft": 42,
    "medium": 84,
    "accent": 127,
}

# Tempo ranges by style (BPM)
TEMPO_RANGES = {
    "deep_house": (118, 126),
    "tech_house": (124, 130),
    "techno": (128, 140),
    "minimal": (120, 135),
}

# Pattern templates (16-step patterns)
PATTERNS = {
    "four_on_the_floor": {
        "kick": [1, 5, 9, 13],
        "snare": [5, 13],
        "hihat_closed": [2, 4, 6, 8, 10, 12, 14, 16],
    },
    "half_time": {
        "kick": [1, 9],
        "snare": [5, 13],
        "hihat_closed": [2, 4, 6, 8, 10, 12, 14, 16],
    },
    "minimal": {
        "kick": [1, 5, 9, 13],
        "snare": [5],
        "hihat_closed": [3, 7, 11, 15],
    },
}

def get_tempo_for_style(style: str) -> int:
    """Get recommended tempo for a style."""
    if style not in TEMPO_RANGES:
        return 128  # default techno tempo
    start, end = TEMPO_RANGES[style]
    return (start + end) // 2


def get_pattern_template(template_name: str) -> dict:
    """Get a pattern template by name."""
    return PATTERNS.get(template_name, PATTERNS["four_on_the_floor"])
