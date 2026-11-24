"""
MIDI Driver Tests — Verify port scanning and MIDI communication
"""
import pytest
from midi_driver import MidiDriver, MidiPort


class TestMidiDriver:
    """Test MIDI driver core functionality"""

    def test_midi_driver_init(self):
        driver = MidiDriver()
        assert driver.ports == {}
        assert driver.output_ports == {}
        assert driver.callbacks == []

    def test_scan_ports_caching(self):
        """Port scanning should cache for 1 second"""
        driver = MidiDriver()
        
        # First scan
        ports1 = driver.scan_ports(force=True)
        # Immediate second scan (cached)
        ports2 = driver.scan_ports(force=False)
        
        # Both should return same list (or empty if no ports available)
        assert ports1 == ports2

    def test_scan_ports_force(self):
        """Force flag should bypass cache"""
        driver = MidiDriver()
        
        ports1 = driver.scan_ports(force=True)
        # Force scan bypasses cache
        ports2 = driver.scan_ports(force=True)
        
        # Both should be valid
        assert isinstance(ports1, list)
        assert isinstance(ports2, list)

    def test_midi_port_dataclass(self):
        """Test MidiPort descriptor"""
        port = MidiPort(
            name="Test Port",
            port_id="test_port",
            is_output=True,
            is_input=False,
            online=True
        )
        
        assert port.name == "Test Port"
        assert port.port_id == "test_port"
        assert port.is_output
        assert not port.is_input
        assert port.online


class TestRhythmWolfDriver:
    """Test Rhythm Wolf MIDI driver"""
    
    def test_rhythm_wolf_voices(self):
        """Verify Rhythm Wolf voice-to-note mapping"""
        from rhythm_wolf_driver import RhythmWolfMidiDriver
        
        driver = RhythmWolfMidiDriver()
        
        # Check voice notes
        assert driver.VOICE_NOTES[0] == 36  # Kick
        assert driver.VOICE_NOTES[1] == 38  # Snare
        assert driver.VOICE_NOTES[2] == 42  # Closed hat
        assert driver.VOICE_NOTES[3] == 46  # Open hat
        assert driver.VOICE_NOTES[4] == 43  # Tom
        assert driver.VOICE_NOTES[5] == 50  # Perc

    def test_rhythm_wolf_channel(self):
        """Rhythm Wolf uses MIDI channel 10 (index 9)"""
        from rhythm_wolf_driver import RhythmWolfMidiDriver
        
        driver = RhythmWolfMidiDriver()
        assert driver.MIDI_CHANNEL == 9

    def test_rhythm_wolf_init(self):
        """Test driver initialization"""
        from rhythm_wolf_driver import RhythmWolfMidiDriver
        
        driver = RhythmWolfMidiDriver()
        assert driver.port_name is None
        assert not driver.is_online()

    def test_rhythm_wolf_disconnect_when_not_connected(self):
        """Disconnect on unconnected driver should be safe"""
        from rhythm_wolf_driver import RhythmWolfMidiDriver
        
        driver = RhythmWolfMidiDriver()
        # Should not crash
        assert driver.disconnect() == True
        assert driver.port_name is None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
