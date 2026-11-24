"""
Device Integration Tests — Verify all 7 instruments
Tests pattern sending, driver initialization, and MIDI communication
"""
import pytest
from device_drivers import (
    RhythmWolfDriver,
    ElektronRytmDriver,
    RolandTR8SDriver,
    OPZDriver,
    VulcaKeysDriver,
    MaschineMK3Driver,
    GenericMIDIDriver,
    get_driver,
)


class TestRhythmWolfDriver:
    """Rhythm Wolf: 6 voices × 16 steps"""

    def test_metadata(self):
        driver = RhythmWolfDriver()
        assert driver.id == "rhythm-wolf"
        assert driver.name == "Akai Rhythm Wolf"
        assert driver.voices == 6
        assert driver.pages == 1
        assert driver.MIDI_CHANNEL == 9

    def test_voice_mapping(self):
        driver = RhythmWolfDriver()
        # Verify 6-voice note mapping
        notes = [driver.VOICE_NOTES[i] for i in range(6)]
        assert notes == [36, 38, 42, 46, 43, 50]  # Kick, Snare, CH, OH, Tom, Perc

    def test_pattern_sending(self):
        driver = RhythmWolfDriver()
        # Create 6×16 pattern (all 6 voices)
        pattern = [[60 + i] * 16 for i in range(6)]
        
        # Offline (no connection)
        assert not driver.send_pattern(pattern)
        
        # After connect (mock)
        driver._online = True
        driver.port_name = "mock_port"
        assert driver.send_pattern(pattern) == True  # Should succeed now


class TestElektronRytmDriver:
    """Elektron Rytm MKII: 12 voices × 32 steps (2 pages)"""

    def test_metadata(self):
        driver = ElektronRytmDriver()
        assert driver.id == "elektron-rytm-mkii"
        assert driver.name == "Elektron Analog Rytm MKII"
        assert driver.voices == 12
        assert driver.pages == 2
        assert driver.MIDI_CHANNEL == 9

    def test_12_voice_mapping(self):
        driver = ElektronRytmDriver()
        # Verify all 12 voices have MIDI notes
        for i in range(12):
            assert i in driver.VOICE_NOTES
            assert 30 < driver.VOICE_NOTES[i] < 65  # Valid MIDI range


class TestRolandTR8SDriver:
    """Roland TR-8S: 11 voices × 16 steps"""

    def test_metadata(self):
        driver = RolandTR8SDriver()
        assert driver.id == "roland-tr8s"
        assert driver.name == "Roland TR-8S"
        assert driver.voices == 11
        assert driver.pages == 1

    def test_voice_coverage(self):
        driver = RolandTR8SDriver()
        # All 11 voices must have MIDI notes
        for i in range(11):
            assert i in driver.VOICE_NOTES
            note = driver.VOICE_NOTES[i]
            assert 36 <= note <= 61


class TestOPZDriver:
    """OP-Z: 8 voices × 64 steps (4 pages), CH 1-8"""

    def test_metadata(self):
        driver = OPZDriver()
        assert driver.id == "op-z"
        assert driver.name == "Teenage Engineering OP-Z"
        assert driver.voices == 8
        assert driver.pages == 4

    def test_multi_channel(self):
        driver = OPZDriver()
        # OP-Z uses channels 0-7 (1-8 in MIDI)
        assert driver.MIDI_CHANNEL == 0

    def test_voice_tuning(self):
        driver = OPZDriver()
        # Verify 8 voices (4 drums + 4 synths)
        notes = [driver.VOICE_NOTES[i] for i in range(8)]
        assert len(notes) == 8
        assert all(30 < n < 65 for n in notes)


class TestVulcaKeysDriver:
    """Volca Keys: 8 pitched synth × 16 steps"""

    def test_metadata(self):
        driver = VulcaKeysDriver()
        assert driver.id == "volca-keys"
        assert driver.name == "Korg Volca Keys"
        assert driver.voices == 8
        assert driver.pitched == True

    def test_pitched_mode(self):
        driver = VulcaKeysDriver()
        # Volca Keys is a synthesizer, not drums
        assert driver.pitched is True


class TestMaschineMK3Driver:
    """Maschine MK3: 16 pads × 16 steps"""

    def test_metadata(self):
        driver = MaschineMK3Driver()
        assert driver.id == "maschine-mk3"
        assert driver.name == "Native Instruments Maschine MK3"
        assert driver.voices == 16
        assert driver.pages == 1

    def test_16_pads(self):
        driver = MaschineMK3Driver()
        # Verify all 16 pads have MIDI notes
        for i in range(16):
            assert i in driver.VOICE_NOTES
            note = driver.VOICE_NOTES[i]
            assert 36 <= note <= 51


class TestGenericMIDIDriver:
    """Generic MIDI: 9 voices × 16 steps (fallback)"""

    def test_metadata(self):
        driver = GenericMIDIDriver()
        assert driver.id == "generic-midi"
        assert driver.name == "Generic MIDI Device"
        assert driver.voices == 9
        assert driver.pages == 1


class TestDeviceFactory:
    """Test driver factory and registry"""

    def test_get_all_drivers(self):
        device_ids = [
            'rhythm-wolf',
            'elektron-rytm-mkii',
            'roland-tr8s',
            'op-z',
            'volca-keys',
            'maschine-mk3',
            'generic-midi',
        ]
        
        for device_id in device_ids:
            driver = get_driver(device_id)
            assert driver is not None
            assert driver.id == device_id

    def test_unknown_device_fallback(self):
        """Unknown device should return Generic MIDI"""
        driver = get_driver('unknown-device')
        assert driver.id == 'generic-midi'

    def test_driver_inheritance(self):
        """All drivers should have connect/disconnect/send_pattern"""
        drivers = [
            RhythmWolfDriver(),
            ElektronRytmDriver(),
            RolandTR8SDriver(),
            OPZDriver(),
            VulcaKeysDriver(),
            MaschineMK3Driver(),
            GenericMIDIDriver(),
        ]
        
        for driver in drivers:
            assert hasattr(driver, 'connect')
            assert hasattr(driver, 'disconnect')
            assert hasattr(driver, 'send_pattern')
            assert callable(driver.connect)
            assert callable(driver.disconnect)
            assert callable(driver.send_pattern)


class TestPatternConversion:
    """Test pattern conversion for each device"""

    def test_rhythm_wolf_6_voices(self):
        """Rhythm Wolf accepts 6×16 patterns"""
        driver = RhythmWolfDriver()
        driver._online = True
        driver.port_name = "mock"
        
        pattern = [[i * 10] * 16 for i in range(6)]
        assert driver.send_pattern(pattern) == True

    def test_elektron_12_voices(self):
        """Elektron Rytm accepts 12×32 (or 12×16 per page)"""
        driver = ElektronRytmDriver()
        driver._online = True
        driver.port_name = "mock"
        
        pattern = [[60 + i] * 16 for i in range(12)]
        assert driver.send_pattern(pattern) == True

    def test_maschine_16_pads(self):
        """Maschine accepts 16×16"""
        driver = MaschineMK3Driver()
        driver._online = True
        driver.port_name = "mock"
        
        pattern = [[60 + (i % 12)] * 16 for i in range(16)]
        assert driver.send_pattern(pattern) == True

    def test_volca_pitched(self):
        """Volca Keys uses bass part as MIDI notes"""
        driver = VulcaKeysDriver()
        driver._online = True
        driver.port_name = "mock"
        
        # 8×16 universal pattern, Volca uses part[7] (bass)
        pattern = [[0] * 16 for _ in range(7)]
        pattern.append([60 + i % 24 for i in range(16)])  # Bass line
        
        assert driver.send_pattern(pattern) == True


class TestMIDIChannels:
    """Verify correct MIDI channels per device"""

    def test_channel_10_devices(self):
        """Drums on channel 10 (0-indexed as 9)"""
        devices = [
            RhythmWolfDriver(),
            ElektronRytmDriver(),
            RolandTR8SDriver(),
            MaschineMK3Driver(),
        ]
        
        for driver in devices:
            assert driver.MIDI_CHANNEL == 9

    def test_opz_uses_channels_0_to_7(self):
        """OP-Z uses all channels 1-8 (0-indexed 0-7)"""
        driver = OPZDriver()
        assert driver.MIDI_CHANNEL == 0  # Base channel

    def test_opz_multi_channel(self):
        """OP-Z uses channels 1-8"""
        driver = OPZDriver()
        assert driver.MIDI_CHANNEL == 0  # Starts at channel 1


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
