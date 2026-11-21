"""MIDI sender for Akai Rhythm Wolf."""

import time
from typing import List, Tuple, Optional
import mido
from .mappings import DRUM_CHANNEL, SYNTH_CHANNEL


class MIDISender:
    """Sends MIDI patterns to Rhythm Wolf."""

    def __init__(self, device_name: Optional[str] = None):
        """Initialize MIDI sender.

        Args:
            device_name: Name of MIDI output device. If None, lists available devices.
        """
        self.device_name = device_name
        self.output = None

    def list_devices(self) -> List[str]:
        """List available MIDI output devices."""
        return mido.get_output_names()

    def connect(self, device_name: Optional[str] = None) -> bool:
        """Connect to MIDI output device.

        Args:
            device_name: Name of device to connect to.

        Returns:
            True if connected, False otherwise.
        """
        name = device_name or self.device_name

        if not name:
            devices = self.list_devices()
            if not devices:
                print("No MIDI output devices found")
                return False
            # Try to find Rhythm Wolf
            for device in devices:
                if "Rhythm Wolf" in device or "wolf" in device.lower():
                    name = device
                    break
            else:
                name = devices[0]
                print(f"Using first available device: {name}")

        try:
            self.output = mido.open_output(name)
            self.device_name = name
            print(f"Connected to: {name}")
            return True
        except Exception as e:
            print(f"Failed to connect: {e}")
            return False

    def send_pattern(self, pattern: List[Tuple[int, int, int]], tempo: int = 128,
                    quantize: bool = True) -> None:
        """Send pattern to Rhythm Wolf.

        Args:
            pattern: List of (channel, note, velocity) tuples
            tempo: Tempo in BPM (used for timing)
            quantize: If True, snap to 16th note grid
        """
        if not self.output:
            print("Not connected to device")
            return

        beat_duration = 60.0 / tempo  # Duration of a beat in seconds
        step_duration = beat_duration / 4  # 16th note

        print(f"Sending {len(pattern)} events at {tempo} BPM...")

        for i, (channel, note, velocity) in enumerate(pattern):
            # Send note on
            msg = mido.Message('note_on', channel=channel-1, note=note, velocity=velocity)
            self.output.send(msg)

            # Brief note duration (16th note)
            time.sleep(step_duration * 0.9)

            # Send note off
            msg_off = mido.Message('note_off', channel=channel-1, note=note)
            self.output.send(msg_off)

            # Time until next note
            time.sleep(step_duration * 0.1)

    def disconnect(self) -> None:
        """Disconnect from MIDI device."""
        if self.output:
            self.output.close()
            self.output = None
            print("Disconnected")
