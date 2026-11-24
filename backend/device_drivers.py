"""
Device Drivers — All 7 supported drum machines
Implements native MIDI communication for each device
"""
import logging
from typing import List
from device_adapter import RhythmWolfAdapter, GenericMIDIAdapter
from midi_driver import midi_driver

logger = logging.getLogger(__name__)


# ========== RHYTHM WOLF (6 voices, 16 steps, CH 10) ==========
class RhythmWolfDriver(RhythmWolfAdapter):
    """Akai Rhythm Wolf"""
    MIDI_CHANNEL = 9
    VOICE_NOTES = {
        0: 36,  # Kick
        1: 38,  # Snare
        2: 42,  # Closed Hat
        3: 46,  # Open Hat
        4: 43,  # Tom
        5: 50,  # Perc
    }

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Rhythm Wolf on {port}")
                return True
        except Exception as e:
            logger.error(f"Rhythm Wolf connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(6, len(pattern))):
                note = self.VOICE_NOTES[voice_idx]
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), self.MIDI_CHANNEL)
                        sent += 1
            logger.info(f"Rhythm Wolf: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"Rhythm Wolf send failed: {e}")
            return False


# ========== ELEKTRON ANALOG RYTM MKII (12 voices, 32 steps, CH 10) ==========
class ElektronRytmDriver(RhythmWolfAdapter):
    """Elektron Analog Rytm MKII - 12 voices × 32 steps"""
    id = "elektron-rytm-mkii"
    name = "Elektron Analog Rytm MKII"
    voices = 12
    pages = 2  # 32 steps = 2 pages of 16
    MIDI_CHANNEL = 9

    VOICE_NOTES = {
        0: 36,   # BD (Kick)
        1: 38,   # SD (Snare)
        2: 42,   # CH (Closed Hat)
        3: 46,   # OH (Open Hat)
        4: 43,   # Perc 1 (Tom)
        5: 50,   # Perc 2
        6: 51,   # Perc 3
        7: 52,   # Perc 4
        8: 53,   # Perc 5
        9: 48,   # Clap
        10: 61,  # Cymbal 1
        11: 62,  # Cymbal 2
    }

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Elektron Rytm on {port}")
                return True
        except Exception as e:
            logger.error(f"Elektron connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(12, len(pattern))):
                note = self.VOICE_NOTES.get(voice_idx, 36)
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), self.MIDI_CHANNEL)
                        sent += 1
            logger.info(f"Elektron Rytm: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"Elektron send failed: {e}")
            return False


# ========== ROLAND TR-8S (11 voices, 16 steps, CH 10) ==========
class RolandTR8SDriver(RhythmWolfAdapter):
    """Roland TR-8S - 11 drums × 16 steps"""
    id = "roland-tr8s"
    name = "Roland TR-8S"
    voices = 11
    pages = 1
    MIDI_CHANNEL = 9

    VOICE_NOTES = {
        0: 36,  # BD
        1: 38,  # SD
        2: 42,  # CH
        3: 46,  # OH
        4: 43,  # Tom H
        5: 45,  # Tom M
        6: 41,  # Tom L
        7: 50,  # Perc H
        8: 48,  # Perc L
        9: 61,  # Cymbal
        10: 49, # Clap
    }

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Roland TR-8S on {port}")
                return True
        except Exception as e:
            logger.error(f"Roland connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(11, len(pattern))):
                note = self.VOICE_NOTES.get(voice_idx, 36)
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), self.MIDI_CHANNEL)
                        sent += 1
            logger.info(f"Roland TR-8S: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"Roland send failed: {e}")
            return False


# ========== TEENAGE ENGINEERING OP-Z (8 voices, 64 steps, CH 1-8) ==========
class OPZDriver(RhythmWolfAdapter):
    """Teenage Engineering OP-Z - 8 voices × 64 steps, channels 1-8"""
    id = "op-z"
    name = "Teenage Engineering OP-Z"
    voices = 8
    pages = 4  # 64 steps = 4 pages of 16
    MIDI_CHANNEL = 0  # Channels 1-8 (0-indexed)

    VOICE_NOTES = {
        0: 36,  # Drum 1
        1: 38,  # Drum 2
        2: 42,  # Drum 3
        3: 46,  # Drum 4
        4: 43,  # Synth 1
        5: 50,  # Synth 2
        6: 48,  # Synth 3
        7: 60,  # Synth 4
    }

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected OP-Z on {port}")
                return True
        except Exception as e:
            logger.error(f"OP-Z connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(8, len(pattern))):
                note = self.VOICE_NOTES.get(voice_idx, 36)
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), voice_idx)
                        sent += 1
            logger.info(f"OP-Z: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"OP-Z send failed: {e}")
            return False


# ========== KORG VOLCA KEYS (8 voices pitched, 16 steps, CH 1) ==========
class VulcaKeysDriver(RhythmWolfAdapter):
    """Korg Volca Keys - 8 pitched synth voices × 16 steps"""
    id = "volca-keys"
    name = "Korg Volca Keys"
    voices = 8
    pages = 1
    pitched = True  # Pitched synth, not drums

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Volca Keys on {port}")
                return True
        except Exception as e:
            logger.error(f"Volca Keys connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            # Volca Keys: use pattern[7] (bass) as MIDI notes
            for vel in pattern[7]:  # Bass part
                if vel > 0 and vel <= 127:
                    midi_driver.send_note_on(self.port_name, vel, min(100, 127), 0)
                    sent += 1
            logger.info(f"Volca Keys: sent {sent} notes")
            return True
        except Exception as e:
            logger.error(f"Volca Keys send failed: {e}")
            return False


# ========== NATIVE INSTRUMENTS MASCHINE MK3 (16 pads, 16 steps, CH 10) ==========
class MaschineMK3Driver(RhythmWolfAdapter):
    """NI Maschine MK3 - 16 drum pads × 16 steps"""
    id = "maschine-mk3"
    name = "Native Instruments Maschine MK3"
    voices = 16
    pages = 1
    MIDI_CHANNEL = 9

    VOICE_NOTES = {
        0: 36, 1: 37, 2: 38, 3: 39, 4: 40, 5: 41, 6: 42, 7: 43,
        8: 44, 9: 45, 10: 46, 11: 47, 12: 48, 13: 49, 14: 50, 15: 51,
    }

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Maschine MK3 on {port}")
                return True
        except Exception as e:
            logger.error(f"Maschine connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(16, len(pattern))):
                note = self.VOICE_NOTES.get(voice_idx, 36 + voice_idx)
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), self.MIDI_CHANNEL)
                        sent += 1
            logger.info(f"Maschine MK3: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"Maschine send failed: {e}")
            return False


# ========== GENERIC MIDI (9 voices, 16 steps, CH 10) ==========
class GenericMIDIDriver(GenericMIDIAdapter):
    """Generic MIDI Device - fallback for any MIDI device"""

    def __init__(self):
        super().__init__()
        self.port_name = None

    def connect(self, port: str) -> bool:
        try:
            midi_port = midi_driver.open_output(port)
            if midi_port:
                self.port_name = port
                self._online = True
                logger.info(f"✅ Connected Generic MIDI on {port}")
                return True
        except Exception as e:
            logger.error(f"Generic MIDI connect failed: {e}")
        return False

    def disconnect(self) -> bool:
        if self.port_name:
            midi_driver.close_output(self.port_name)
            self._online = False
            self.port_name = None
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        if not self._online or not self.port_name:
            return False
        try:
            sent = 0
            for voice_idx in range(min(9, len(pattern))):
                note = 36 + voice_idx  # C1–G1
                for vel in pattern[voice_idx]:
                    if vel > 0:
                        midi_driver.send_note_on(self.port_name, note, min(vel, 127), 9)
                        sent += 1
            logger.info(f"Generic MIDI: sent {sent} events")
            return True
        except Exception as e:
            logger.error(f"Generic MIDI send failed: {e}")
            return False


# ========== DRIVER REGISTRY ==========
DRIVER_MAP = {
    'rhythm-wolf': RhythmWolfDriver,
    'elektron-rytm-mkii': ElektronRytmDriver,
    'roland-tr8s': RolandTR8SDriver,
    'op-z': OPZDriver,
    'volca-keys': VulcaKeysDriver,
    'maschine-mk3': MaschineMK3Driver,
    'generic-midi': GenericMIDIDriver,
}


def get_driver(device_id: str):
    """Factory: Get driver by device ID"""
    driver_class = DRIVER_MAP.get(device_id)
    if driver_class:
        return driver_class()
    logger.warning(f"Unknown device: {device_id}")
    return GenericMIDIDriver()


def list_drivers() -> List[str]:
    """List all available drivers"""
    return list(DRIVER_MAP.keys())
