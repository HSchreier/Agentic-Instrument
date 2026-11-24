"""
MIDI Driver Layer — Platform-agnostic MIDI communication
Handles USB hotplug, port management, and native MIDI I/O
"""
import logging
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
import time

logger = logging.getLogger(__name__)

try:
    import mido
    HAS_MIDO = True
except ImportError:
    HAS_MIDO = False
    logger.warning("mido not installed - MIDI I/O disabled")


@dataclass
class MidiPort:
    """MIDI port descriptor"""
    name: str
    port_id: str
    is_output: bool
    is_input: bool
    online: bool = True


class MidiDriver:
    """Platform-agnostic MIDI driver for all devices"""

    def __init__(self):
        self.ports: Dict[str, object] = {}
        self.output_ports: Dict[str, object] = {}
        self.callbacks: List[Callable] = []
        self._last_scan = 0
        self._last_ports = []

    def scan_ports(self, force=False) -> List[MidiPort]:
        """
        Scan for available MIDI ports.
        Returns list of output ports (devices to control).
        """
        now = time.time()
        if not force and (now - self._last_scan) < 1.0:
            # Cache for 1 second to avoid excessive scanning
            return self._last_ports

        if not HAS_MIDO:
            return []

        ports = []
        try:
            for port_name in mido.get_output_names():
                port_id = port_name.lower().replace(' ', '_').replace(':', '')
                ports.append(MidiPort(
                    name=port_name,
                    port_id=port_id,
                    is_output=True,
                    is_input=False,
                    online=True
                ))
            self._last_ports = ports
            self._last_scan = now
        except Exception as e:
            logger.error(f"Error scanning MIDI ports: {e}")

        return ports

    def open_output(self, port_name: str):
        """Open MIDI output port"""
        if not HAS_MIDO:
            logger.warning("mido not available")
            return None

        try:
            port = mido.open_output(port_name)
            self.output_ports[port_name] = port
            logger.info(f"Opened MIDI output: {port_name}")
            return port
        except Exception as e:
            logger.error(f"Failed to open MIDI output {port_name}: {e}")
            return None

    def close_output(self, port_name: str) -> bool:
        """Close MIDI output port"""
        if port_name in self.output_ports:
            try:
                self.output_ports[port_name].close()
                del self.output_ports[port_name]
                logger.info(f"Closed MIDI output: {port_name}")
                return True
            except Exception as e:
                logger.error(f"Error closing {port_name}: {e}")
        return False

    def send_note_on(self, port_name: str, note: int, velocity: int = 100, channel: int = 0) -> bool:
        """Send MIDI Note On message"""
        if port_name not in self.output_ports:
            logger.warning(f"Port {port_name} not open")
            return False

        try:
            port = self.output_ports[port_name]
            msg = mido.Message('note_on', note=note, velocity=velocity, channel=channel)
            port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending note on {port_name}: {e}")
            return False

    def send_note_off(self, port_name: str, note: int, channel: int = 0) -> bool:
        """Send MIDI Note Off message"""
        if port_name not in self.output_ports:
            return False

        try:
            port = self.output_ports[port_name]
            msg = mido.Message('note_off', note=note, channel=channel)
            port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending note off: {e}")
            return False

    def send_control_change(self, port_name: str, control: int, value: int, channel: int = 0) -> bool:
        """Send MIDI CC message"""
        if port_name not in self.output_ports:
            return False

        try:
            port = self.output_ports[port_name]
            msg = mido.Message('control_change', control=control, value=value, channel=channel)
            port.send(msg)
            return True
        except Exception as e:
            logger.error(f"Error sending CC: {e}")
            return False

    def send_pattern(self, port_name: str, pattern: List[List[int]], velocity: int = 100, 
                    channel: int = 0, timing_ms: int = 50) -> bool:
        """
        Send 8×16 pattern to device.
        Transmits all notes sequentially with timing.
        """
        if port_name not in self.output_ports:
            logger.warning(f"Port {port_name} not open")
            return False

        try:
            port = self.output_ports[port_name]
            count = 0

            # Send all notes from pattern
            for voice_idx, voice_notes in enumerate(pattern):
                for step_idx, note in enumerate(voice_notes):
                    if note > 0:
                        msg = mido.Message('note_on', note=note, velocity=velocity, channel=channel)
                        port.send(msg)
                        count += 1

            logger.info(f"Sent {count} events to {port_name}")
            return True
        except Exception as e:
            logger.error(f"Error sending pattern to {port_name}: {e}")
            return False

    def close_all(self) -> bool:
        """Close all open ports"""
        for port_name in list(self.output_ports.keys()):
            self.close_output(port_name)
        return True

    def __del__(self):
        """Cleanup on destruction"""
        self.close_all()


# Global driver instance
midi_driver = MidiDriver()
