"""
Device Adapter Tests — Verify all device implementations
"""
import pytest
from device_adapter import (
    DeviceAdapter,
    RhythmWolfAdapter,
    GenericMIDIAdapter,
    get_adapter,
    list_adapters,
)


class TestDeviceAdapterInterface:
    """Test abstract base class contract"""

    def test_adapter_registry(self):
        adapters = list_adapters()
        assert 'rhythm-wolf' in adapters
        assert 'generic-midi' in adapters
        assert len(adapters) >= 2

    def test_get_adapter(self):
        wolf = get_adapter('rhythm-wolf')
        assert wolf is not None
        assert isinstance(wolf, RhythmWolfAdapter)

        generic = get_adapter('generic-midi')
        assert generic is not None
        assert isinstance(generic, GenericMIDIAdapter)

    def test_get_nonexistent_adapter(self):
        adapter = get_adapter('nonexistent-device')
        assert adapter is None


class TestRhythmWolfAdapter:
    """Test Rhythm Wolf implementation"""

    def test_device_metadata(self):
        adapter = RhythmWolfAdapter()
        assert adapter.id == 'rhythm-wolf'
        assert adapter.name == 'Akai Rhythm Wolf'
        assert adapter.voices == 6
        assert adapter.pages == 1
        assert adapter.midi_channel == 1

    def test_connect_disconnect(self):
        adapter = RhythmWolfAdapter()
        assert adapter.connect('/dev/ttyUSB0')
        assert adapter.is_online()
        assert adapter.disconnect()
        assert not adapter.is_online()

    def test_send_pattern(self):
        adapter = RhythmWolfAdapter()
        adapter.connect('/dev/ttyUSB0')

        # 8×16 universal pattern
        pattern = [
            [60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0, 60, 0],  # Kick
            [64, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0, 0, 64, 0, 0, 0],  # Snare
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Clap
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Tom
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Perc
            [67, 0, 67, 0, 67, 0, 67, 0, 67, 0, 67, 0, 67, 0, 67, 0],  # Hat
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Open
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Bass
        ]

        assert adapter.send_pattern(pattern, velocity=100)

    def test_topology(self):
        adapter = RhythmWolfAdapter()
        adapter.connect('/dev/ttyUSB0')
        topo = adapter.get_topology()

        assert topo['id'] == 'rhythm-wolf'
        assert topo['voices'] == 6
        assert topo['pages'] == 1
        assert topo['online']


class TestGenericMIDIAdapter:
    """Test Generic MIDI fallback implementation"""

    def test_device_metadata(self):
        adapter = GenericMIDIAdapter()
        assert adapter.id == 'generic-midi'
        assert adapter.name == 'Generic MIDI Device'
        assert adapter.voices == 9
        assert adapter.pages == 1

    def test_connect(self):
        adapter = GenericMIDIAdapter()
        assert adapter.connect('/dev/ttyUSB1')
        assert adapter.is_online()

    def test_send_pattern_all_parts(self):
        adapter = GenericMIDIAdapter()
        adapter.connect('/dev/ttyUSB1')

        # 8×16 with all parts
        pattern = [[60 + i * 2 for _ in range(16)] for i in range(8)]
        # Add 9th part for generic (it supports 9 voices)
        pattern.append([0] * 16)

        assert adapter.send_pattern(pattern, velocity=80)


class TestPatternConversion:
    """Test pattern conversion from universal to device format"""

    def test_rhythm_wolf_conversion(self):
        """8×16 → 6×16 (drop parts 7-8)"""
        adapter = RhythmWolfAdapter()
        adapter.connect('/dev/ttyUSB0')

        pattern = [
            [60, 0] * 8,  # Kick → voice 0
            [64, 0] * 8,  # Snare → voice 1
            [0] * 16,     # Clap (dropped)
            [0] * 16,     # Tom (dropped)
            [0] * 16,     # Perc (dropped)
            [67, 0] * 8,  # Hat → voice 5
            [0] * 16,     # Open (dropped)
            [0] * 16,     # Bass (dropped)
        ]

        # Rhythm Wolf has 6 voices, so only first 6 are used
        assert adapter.send_pattern(pattern)

    def test_generic_midi_conversion(self):
        """8×16 → 9×16 (add generic 9th part)"""
        adapter = GenericMIDIAdapter()
        adapter.connect('/dev/ttyUSB1')

        pattern = [[60 + i for _ in range(16)] for i in range(8)]
        # Generic supports 9 voices, add empty 9th
        pattern.append([0] * 16)

        assert adapter.send_pattern(pattern)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
