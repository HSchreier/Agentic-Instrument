"""
Rhythm Wolf Device Driver
Akai Rhythm Wolf (6 voices, 16 steps, MIDI Channel 10)
"""
import logging
from typing import List
from device_adapter import RhythmWolfAdapter
from midi_driver import midi_driver

logger = logging.getLogger(__name__)


class RhythmWolfMidiDriver(RhythmWolfAdapter):
    """Rhythm Wolf driver with native MIDI communication"""

    MIDI_CHANNEL = 9  # Channel 10 (0-indexed)
    VOICE_NOTES = {
        0: 36,  # Kick = C1
        1: 38,  # Snare = D1
        2: 42,  # Closed hat = F#1
        3: 46,  # Open hat = A#1
        4: 43,  # Tom = G1
        5: 50,  # Perc = D2
    }

    def __init__(self):
        super().__init__()
        self.port_name: str = None

    def connect(self, port: str) -> bool:
        """Connect to Rhythm Wolf via MIDI port"""
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"Connected Rhythm Wolf on {port}")
                return True
        except Exception as e:
            logger.error(f"Failed to connect Rhythm Wolf: {e}")
        return False

    def disconnect(self) -> bool:
        """Disconnect from Rhythm Wolf"""
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        """
        Send 8×16 universal pattern to Rhythm Wolf.
        Maps voices 0-5 to Rhythm Wolf's 6 drum sounds.
        """
        if not self._online or not self.port_name:
            logger.warning("Rhythm Wolf not connected")
            return False

        try:
            sent_count = 0
            for voice_idx in range(min(6, len(pattern))):
                note = self.VOICE_NOTES[voice_idx]
                voice_data = pattern[voice_idx]

                for step_idx, vel in enumerate(voice_data):
                    if vel > 0:
                        # Send note on
                        midi_driver.send_note_on(
                            self.port_name,
                            note=note,
                            velocity=min(vel, 127),  # Clamp to MIDI range
                            channel=self.MIDI_CHANNEL
                        )
                        sent_count += 1

            logger.info(f"Sent {sent_count} events to Rhythm Wolf")
            return True
        except Exception as e:
            logger.error(f"Error sending pattern to Rhythm Wolf: {e}")
            return False

    def receive_pattern(self):
        """Rhythm Wolf MIDI learning (not implemented in Phase 2)"""
        logger.warning("Receive not implemented")
        return None


# Factory
def create_rhythm_wolf_driver():
    """Create Rhythm Wolf driver instance"""
    return RhythmWolfMidiDriver()
