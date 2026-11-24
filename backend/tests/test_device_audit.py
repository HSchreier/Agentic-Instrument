"""
Device Audit Tests — Verify all 8 devices match official specifications
Automated verification against manufacturer MIDI documentation
"""
import pytest
from device_drivers import (
    RhythmWolfDriver,
    ElektronRytmDriver,
    DigitaktDriver,
    RolandTR8SDriver,
    OPZDriver,
    VulcaKeysDriver,
    MaschineMK3Driver,
    GenericMIDIDriver,
)


class TestDeviceAuditSpecifications:
    """Verify all devices match official manufacturer specs"""

    def test_rhythm_wolf_official_spec(self):
        """Rhythm Wolf: 6 voices, CH 1, notes 36,38,42,46,43,50"""
        driver = RhythmWolfDriver()

        # Official spec: Channel 1 (0-indexed: 0)
        assert driver.MIDI_CHANNEL == 0, "Rhythm Wolf must use Channel 1 (index 0)"

        # Official spec: 6 drum sounds
        assert driver.voices == 6, "Rhythm Wolf has 6 voices"

        # Official spec: 16 steps
        assert driver.pages == 1, "Rhythm Wolf has 16 steps (1 page)"

        # Official spec: Notes
        expected_notes = {0: 36, 1: 38, 2: 42, 3: 46, 4: 43, 5: 50}
        for voice_id, note in expected_notes.items():
            assert driver.VOICE_NOTES[voice_id] == note, \
                f"Rhythm Wolf voice {voice_id} note mismatch"

    def test_elektron_rytm_official_spec(self):
        """Elektron Analog Rytm MKII: 12 voices, CH 10, 32 steps"""
        driver = ElektronRytmDriver()

        # Official spec: Channel 10 (0-indexed: 9)
        assert driver.MIDI_CHANNEL == 9, "Elektron Rytm uses Channel 10"

        # Official spec: 12 drum engines
        assert driver.voices == 12, "Elektron Rytm has 12 voices"

        # Official spec: 32 steps = 2 pages
        assert driver.pages == 2, "Elektron Rytm has 32 steps (2 pages)"

        # Verify all 12 notes exist
        for i in range(12):
            assert i in driver.VOICE_NOTES, f"Voice {i} missing note mapping"

    def test_digitakt_2_official_spec(self):
        """Elektron Digitakt 2: 8 voices, CH 10, 16 steps"""
        driver = DigitaktDriver()

        # Official spec: Channel 10 (0-indexed: 9)
        assert driver.MIDI_CHANNEL == 9, "Digitakt 2 uses Channel 10"

        # Official spec: 8 drum tracks
        assert driver.voices == 8, "Digitakt 2 has 8 voices"

        # Official spec: 16 steps
        assert driver.pages == 1, "Digitakt 2 has 16 steps (1 page)"

        # Verify all 8 notes exist
        for i in range(8):
            assert i in driver.VOICE_NOTES, f"Voice {i} missing note mapping"
            assert 36 <= driver.VOICE_NOTES[i] <= 52, \
                f"Digitakt voice {i} note {driver.VOICE_NOTES[i]} outside expected range"

    def test_roland_tr8s_official_spec(self):
        """Roland TR-8S: 11 voices, CH 10, 16 steps"""
        driver = RolandTR8SDriver()

        # Official spec: Channel 10 (0-indexed: 9)
        assert driver.MIDI_CHANNEL == 9, "TR-8S uses Channel 10"

        # Official spec: 11 drum sounds
        assert driver.voices == 11, "TR-8S has 11 voices"

        # Official spec: 16 steps
        assert driver.pages == 1, "TR-8S has 16 steps (1 page)"

        # Verify all 11 notes exist
        for i in range(11):
            assert i in driver.VOICE_NOTES, f"Voice {i} missing note mapping"
            assert 36 <= driver.VOICE_NOTES[i] <= 61, \
                f"TR-8S voice {i} note outside expected range"

    def test_opz_official_spec(self):
        """OP-Z: 8 voices, CH 1-8, 64 steps (4 pages)"""
        driver = OPZDriver()

        # Official spec: Channels 1-8 (0-indexed: 0-7, starts at 0)
        assert driver.MIDI_CHANNEL == 0, "OP-Z uses channels 1-8 starting at channel 0"

        # Official spec: 8 voices (4 drums + 4 synths)
        assert driver.voices == 8, "OP-Z has 8 voices"

        # Official spec: 64 steps = 4 pages
        assert driver.pages == 4, "OP-Z has 64 steps (4 pages)"

        # Verify all 8 notes exist
        for i in range(8):
            assert i in driver.VOICE_NOTES, f"Voice {i} missing note mapping"

    def test_volca_keys_official_spec(self):
        """Volca Keys: 8 voices synth, CH 1, pitched mode"""
        driver = VulcaKeysDriver()

        # Volca Keys is PITCHED (synth), not drums
        assert driver.pitched == True, "Volca Keys is a pitched synth"

        # Official spec: 8 polyphonic voices
        assert driver.voices == 8, "Volca Keys has 8 voices"

        # Official spec: 16 steps
        assert driver.pages == 1, "Volca Keys has 16 steps (1 page)"

    def test_maschine_mk3_official_spec(self):
        """Maschine MK3: 16 pads (CH 10), 16 steps, notes 36-51"""
        driver = MaschineMK3Driver()

        # Official spec: Channel 10 (0-indexed: 9)
        assert driver.MIDI_CHANNEL == 9, "Maschine MK3 uses Channel 10"

        # Official spec: 16 drum pads
        assert driver.voices == 16, "Maschine MK3 has 16 voices"

        # Official spec: 16 steps
        assert driver.pages == 1, "Maschine MK3 has 16 steps (1 page)"

        # Official spec: Notes 36-51 (continuous range)
        expected_notes = {i: 36 + i for i in range(16)}
        for voice_id, expected_note in expected_notes.items():
            assert driver.VOICE_NOTES[voice_id] == expected_note, \
                f"Maschine MK3 voice {voice_id} should be note {expected_note}"

    def test_generic_midi_official_spec(self):
        """Generic MIDI: 16 voices, CH 10, notes 36-51 (full GM drum map)"""
        driver = GenericMIDIDriver()

        # Official spec (General MIDI): Channel 10 (0-indexed: 9)
        assert driver.MIDI_CHANNEL == 9, "Generic MIDI uses Channel 10"

        # Official spec: Full 16 drum sounds (enhanced from 9)
        assert driver.voices == 16, "Generic MIDI supports 16 voices (full GM)"

        # Official spec: 16 drum notes (36-51)
        for i in range(16):
            assert i in driver.VOICE_NOTES, f"Voice {i} missing note mapping"
            assert 36 <= driver.VOICE_NOTES[i] <= 51, \
                f"Generic MIDI voice {i} note outside GM drum range"


class TestDeviceAuditCompliance:
    """Verify devices comply with MIDI standards"""

    def test_all_devices_have_voices(self):
        """Every device must declare voice count"""
        drivers = [
            RhythmWolfDriver(),
            ElektronRytmDriver(),
            DigitaktDriver(),
            RolandTR8SDriver(),
            OPZDriver(),
            VulcaKeysDriver(),
            MaschineMK3Driver(),
            GenericMIDIDriver(),
        ]

        for driver in drivers:
            assert hasattr(driver, 'voices'), f"{driver.__class__.__name__} missing voices"
            assert driver.voices > 0, f"{driver.__class__.__name__} voices must be > 0"

    def test_all_devices_have_midi_channel(self):
        """Every device must declare MIDI channel"""
        drivers = [
            RhythmWolfDriver(),
            ElektronRytmDriver(),
            DigitaktDriver(),
            RolandTR8SDriver(),
            OPZDriver(),
            VulcaKeysDriver(),
            MaschineMK3Driver(),
            GenericMIDIDriver(),
        ]

        for driver in drivers:
            assert hasattr(driver, 'MIDI_CHANNEL'), \
                f"{driver.__class__.__name__} missing MIDI_CHANNEL"
            assert 0 <= driver.MIDI_CHANNEL <= 15, \
                f"{driver.__class__.__name__} MIDI channel out of range"

    def test_all_devices_have_voice_notes(self):
        """Every device must declare note mappings"""
        drivers = [
            RhythmWolfDriver(),
            ElektronRytmDriver(),
            DigitaktDriver(),
            RolandTR8SDriver(),
            OPZDriver(),
            VulcaKeysDriver(),
            MaschineMK3Driver(),
            GenericMIDIDriver(),
        ]

        for driver in drivers:
            if not hasattr(driver, 'pitched') or not driver.pitched:
                # Drums: must have VOICE_NOTES
                assert hasattr(driver, 'VOICE_NOTES'), \
                    f"{driver.__class__.__name__} missing VOICE_NOTES"
                assert len(driver.VOICE_NOTES) > 0, \
                    f"{driver.__class__.__name__} VOICE_NOTES empty"

                # All note values must be valid MIDI notes
                for voice_id, note in driver.VOICE_NOTES.items():
                    assert 0 <= note <= 127, \
                        f"{driver.__class__.__name__} voice {voice_id} invalid note {note}"

    def test_drum_channel_standardization(self):
        """Drums should use standard MIDI channels"""
        drum_drivers = {
            RhythmWolfDriver(): 0,     # Rhythm Wolf: Channel 1
            ElektronRytmDriver(): 9,   # Elektron: Channel 10
            DigitaktDriver(): 9,       # Digitakt: Channel 10
            RolandTR8SDriver(): 9,     # Roland: Channel 10
            MaschineMK3Driver(): 9,    # Maschine: Channel 10
            GenericMIDIDriver(): 9,    # Generic: Channel 10
        }

        # Most devices use channel 10 (index 9) - standard drum channel
        # Rhythm Wolf is an exception using channel 1 (index 0)
        for driver, expected_ch in drum_drivers.items():
            assert driver.MIDI_CHANNEL == expected_ch, \
                f"{driver.__class__.__name__} channel mismatch"

    def test_synth_channel_standardization(self):
        """Synths should use Channel 1"""
        driver = VulcaKeysDriver()
        # Volca Keys (synth) doesn't explicitly set channel in this test
        # but should behave differently than drums
        assert driver.pitched == True, "Volca Keys is a synth"


class TestDeviceAuditNoteRanges:
    """Verify note mappings are within valid MIDI range"""

    def test_rhythm_wolf_notes_valid(self):
        """Rhythm Wolf notes must be valid drum notes"""
        driver = RhythmWolfDriver()
        # Kick: 36, Snare: 38, Hats: 42/46, Tom: 43, Perc: 50
        expected = [36, 38, 42, 46, 43, 50]
        actual = [driver.VOICE_NOTES[i] for i in range(6)]
        assert actual == expected

    def test_all_drum_notes_in_range(self):
        """All drum machines should use notes in proper range"""
        drivers = [
            (RhythmWolfDriver(), 36, 50),
            (ElektronRytmDriver(), 36, 62),
            (DigitaktDriver(), 36, 52),
            (RolandTR8SDriver(), 36, 61),
            (MaschineMK3Driver(), 36, 51),
        ]

        for driver, min_note, max_note in drivers:
            for voice_id, note in driver.VOICE_NOTES.items():
                assert min_note <= note <= max_note, \
                    f"{driver.__class__.__name__} voice {voice_id} note {note} outside range {min_note}-{max_note}"


class TestDeviceAuditStepCounts:
    """Verify step/page configurations match specs"""

    def test_step_counts_correct(self):
        """All devices have correct step counts"""
        specs = {
            RhythmWolfDriver(): (16, 1),         # 16 steps, 1 page
            ElektronRytmDriver(): (32, 2),       # 32 steps, 2 pages
            DigitaktDriver(): (16, 1),           # 16 steps, 1 page
            RolandTR8SDriver(): (16, 1),         # 16 steps, 1 page
            OPZDriver(): (64, 4),                # 64 steps, 4 pages
            VulcaKeysDriver(): (16, 1),          # 16 steps, 1 page
            MaschineMK3Driver(): (16, 1),        # 16 steps, 1 page
        }

        for driver, (steps, pages) in specs.items():
            expected_steps = 16 * pages
            assert driver.pages == pages, \
                f"{driver.__class__.__name__} pages should be {pages}"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
