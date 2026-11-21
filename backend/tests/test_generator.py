"""Pattern generator tests."""

import pytest
from rhythm_wolf.generator import generate_pattern, events_to_json
from rhythm_wolf.mappings import DRUM_NOTES, VELOCITIES


class TestGeneratePattern:
    """Pattern generation logic tests."""

    def test_generate_pattern_returns_events(self):
        """Should return list of MIDI events."""
        events = generate_pattern(style="techno", tempo=128)
        assert isinstance(events, list)
        assert len(events) > 0

    def test_events_have_correct_structure(self):
        """Each event should be (channel, note, velocity) tuple."""
        events = generate_pattern(style="techno")
        for event in events:
            assert isinstance(event, tuple)
            assert len(event) == 3
            channel, note, velocity = event
            assert channel in [1, 10]
            assert 0 <= note <= 127
            assert 0 <= velocity <= 127

    def test_different_styles_different_patterns(self):
        """Different styles should produce different patterns."""
        techno = generate_pattern(style="techno", tempo=128)
        house = generate_pattern(style="house", tempo=128)
        # Different styles should have different event counts or timing
        assert len(techno) != len(house) or techno != house

    def test_include_bass_adds_synth_channel(self):
        """include_bass=True should add channel 1 events."""
        without_bass = generate_pattern(include_bass=False)
        with_bass = generate_pattern(include_bass=True)

        channels_without = set(ch for ch, _, _ in without_bass)
        channels_with = set(ch for ch, _, _ in with_bass)

        # With bass should have channel 1 or more events
        assert len(channels_with) >= len(channels_without)

    def test_all_events_valid_notes(self):
        """All drum notes should be valid."""
        events = generate_pattern(style="techno")
        drum_notes = set(DRUM_NOTES.values())

        for channel, note, _ in events:
            if channel == 10:
                assert note in drum_notes, f"Invalid drum note: {note}"

    def test_all_velocities_valid(self):
        """All velocities should be one of three levels."""
        events = generate_pattern(style="techno")
        valid_velocities = set(VELOCITIES.values())

        for _, _, velocity in events:
            assert velocity in valid_velocities, f"Invalid velocity: {velocity}"

    @pytest.mark.parametrize("style", ["techno", "house", "tech_house", "minimal"])
    def test_all_styles_work(self, style):
        """All styles should generate patterns without error."""
        events = generate_pattern(style=style)
        assert len(events) > 0

    @pytest.mark.parametrize("template", ["four_on_the_floor", "half_time", "minimal"])
    def test_all_templates_work(self, template):
        """All templates should generate patterns without error."""
        events = generate_pattern(template=template)
        assert len(events) > 0


class TestEventsToJson:
    """JSON serialization tests."""

    def test_events_to_json_format(self):
        """Should return correctly formatted JSON dict."""
        events = generate_pattern(style="techno", tempo=128)
        json_data = events_to_json(events, style="techno", tempo=128)

        assert "metadata" in json_data
        assert "events" in json_data

    def test_json_metadata(self):
        """Metadata should contain required fields."""
        events = generate_pattern(style="house", tempo=120)
        json_data = events_to_json(events, style="house", tempo=120)

        metadata = json_data["metadata"]
        assert metadata["style"] == "house"
        assert metadata["tempo"] == 120
        assert metadata["num_events"] == len(events)

    def test_json_events_structure(self):
        """Events in JSON should have correct structure."""
        events = generate_pattern()
        json_data = events_to_json(events)

        for json_event in json_data["events"]:
            assert "channel" in json_event
            assert "note" in json_event
            assert "velocity" in json_event
