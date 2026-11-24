"""
Device Adapter Interface — Base class for all MIDI device drivers
Phase 2: M2 (Native Device Drivers)
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class DeviceAdapter(ABC):
    """
    Abstract base class for device-specific MIDI drivers.
    Each hardware device (Rhythm Wolf, Elektron, Roland, etc.) gets a concrete implementation.
    """

    # Device metadata (override in subclasses)
    id: str = "generic"
    name: str = "Generic MIDI Device"
    voices: int = 9
    pages: int = 1
    midi_channel: int = 1

    def __init__(self, port: str = None):
        self.port = port
        self._online = False
        self._output = None
        self._input = None

    @abstractmethod
    def connect(self, port: str) -> bool:
        """
        Connect to device on USB port.
        Args:
            port: USB port identifier or MIDI port name
        Returns:
            True if connected, False otherwise
        """
        pass

    @abstractmethod
    def disconnect(self) -> bool:
        """
        Disconnect and cleanup resources.
        Returns:
            True if disconnected cleanly
        """
        pass

    @abstractmethod
    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        """
        Send 8×16 universal pattern to device.
        Args:
            pattern: 8×16 array where pattern[part][step] is MIDI note (0-127)
            velocity: MIDI velocity (1-127)
        Returns:
            True if sent successfully
        """
        pass

    @abstractmethod
    def receive_pattern(self) -> Optional[List[List[int]]]:
        """
        Listen for incoming MIDI from device, return as 8×16 universal pattern.
        Returns:
            8×16 pattern array or None if no data
        """
        pass

    @abstractmethod
    def is_online(self) -> bool:
        """Check if device is connected and responsive."""
        pass

    @abstractmethod
    def get_topology(self) -> Dict:
        """
        Return device voice topology for adapter matching.
        Returns:
            Dict with keys: id, name, voices, pages, midi_channel, online
        """
        pass

    def get_device_info(self) -> Dict:
        """Get current device info."""
        return {
            'id': self.id,
            'name': self.name,
            'port': self.port,
            'voices': self.voices,
            'pages': self.pages,
            'midi_channel': self.midi_channel,
            'online': self.is_online()
        }


class RhythmWolfAdapter(DeviceAdapter):
    """Akai Rhythm Wolf — 6 voices, single page"""

    id = "rhythm-wolf"
    name = "Akai Rhythm Wolf"
    voices = 6
    pages = 1
    midi_channel = 1

    def connect(self, port: str) -> bool:
        logger.info(f"Connecting Rhythm Wolf on {port}")
        # TODO: Implement libmidi connection
        self._online = True
        return True

    def disconnect(self) -> bool:
        logger.info("Disconnecting Rhythm Wolf")
        self._online = False
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        # Map 8×16 → 6×16 (drop drum 7-8)
        for step in range(16):
            for voice in range(6):
                note = pattern[voice][step]
                if note > 0:
                    logger.info(f"Note {note} on voice {voice} step {step}")
        return True

    def receive_pattern(self) -> Optional[List[List[int]]]:
        return None

    def is_online(self) -> bool:
        return self._online

    def get_topology(self) -> Dict:
        return self.get_device_info()


class GenericMIDIAdapter(DeviceAdapter):
    """Generic MIDI — 9 voices, single page (fallback)"""

    id = "generic-midi"
    name = "Generic MIDI Device"
    voices = 9
    pages = 1
    midi_channel = 1

    def connect(self, port: str) -> bool:
        logger.info(f"Connecting Generic MIDI on {port}")
        self._online = True
        return True

    def disconnect(self) -> bool:
        logger.info("Disconnecting Generic MIDI")
        self._online = False
        return True

    def send_pattern(self, pattern: List[List[int]], velocity: int = 100) -> bool:
        for step in range(16):
            for voice in range(self.voices):
                note = pattern[voice][step]
                if note > 0:
                    logger.info(f"Generic MIDI: Note {note} on {voice}/{step}")
        return True

    def receive_pattern(self) -> Optional[List[List[int]]]:
        return None

    def is_online(self) -> bool:
        return self._online

    def get_topology(self) -> Dict:
        return self.get_device_info()


# Registry of all available adapters
ADAPTERS = {
    'rhythm-wolf': RhythmWolfAdapter,
    'generic-midi': GenericMIDIAdapter,
}


def get_adapter(adapter_id: str) -> Optional[DeviceAdapter]:
    """Get adapter instance by ID."""
    adapter_class = ADAPTERS.get(adapter_id)
    return adapter_class() if adapter_class else None


def list_adapters() -> List[str]:
    """List all available adapter IDs."""
    return list(ADAPTERS.keys())
