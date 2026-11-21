#!/usr/bin/env python3
"""CLI for Rhythm Wolf MIDI pattern generation and export."""

import json
import click
from rhythm_wolf.generator import generate_pattern, events_to_json
from rhythm_wolf.sender import MIDISender
from rhythm_wolf.mappings import TEMPO_RANGES


@click.group()
def cli():
    """Rhythm Wolf MIDI pattern generator and sender."""
    pass


@cli.command()
@click.option("--style", type=click.Choice(["techno", "house", "tech_house", "minimal"]),
              default="techno", help="Music style")
@click.option("--tempo", type=int, default=None, help="Tempo in BPM (auto if not set)")
@click.option("--template", type=click.Choice(["four_on_the_floor", "half_time", "minimal"]),
              default="four_on_the_floor", help="Pattern template")
@click.option("--output", type=click.File("w"), default=None,
              help="Save pattern as JSON instead of sending")
def generate(style, tempo, template, output):
    """Generate a drum pattern."""
    if not tempo:
        # Use auto tempo for style
        from rhythm_wolf.mappings import get_tempo_for_style
        tempo = get_tempo_for_style(style)

    click.echo(f"Generating {style} pattern at {tempo} BPM...", err=True)

    events = generate_pattern(style=style, tempo=tempo, template=template)
    pattern_dict = events_to_json(events, style=style, tempo=tempo)

    if output:
        json.dump(pattern_dict, output, indent=2)
        click.echo(f"Saved to {output.name}", err=True)
    else:
        click.echo(json.dumps(pattern_dict, indent=2))


@cli.command()
def devices():
    """List available MIDI devices."""
    sender = MIDISender()
    devices_list = sender.list_devices()

    if not devices_list:
        click.echo("No MIDI devices found")
        return

    click.echo("Available MIDI output devices:")
    for i, device in enumerate(devices_list, 1):
        marker = " <- Rhythm Wolf" if "rhythm" in device.lower() or "wolf" in device.lower() else ""
        click.echo(f"  {i}. {device}{marker}")


@cli.command()
@click.option("--device", default=None, help="MIDI device name (shows list if not provided)")
@click.option("--style", type=click.Choice(["techno", "house", "tech_house", "minimal"]),
              default="techno", help="Music style")
@click.option("--tempo", type=int, default=None, help="Tempo in BPM")
@click.option("--template", type=click.Choice(["four_on_the_floor", "half_time", "minimal"]),
              default="four_on_the_floor", help="Pattern template")
@click.option("--pattern-file", type=click.File("r"), default=None,
              help="Load pattern from JSON file instead of generating")
def send(device, style, tempo, template, pattern_file):
    """Send pattern to Rhythm Wolf.

    1. Put Rhythm Wolf into Record Performance mode (hold SHIFT + press Step 10)
    2. This tool will send MIDI notes
    3. Rhythm Wolf will quantize and record them
    4. Exit recording and save on the device
    """
    sender = MIDISender()

    # Connect to device
    if not sender.connect(device):
        devices_list = sender.list_devices()
        if not devices_list:
            click.echo("Error: No MIDI devices found", err=True)
            return
        click.echo("Available devices:", err=True)
        for d in devices_list:
            click.echo(f"  - {d}", err=True)
        return

    try:
        # Load or generate pattern
        if pattern_file:
            pattern_data = json.load(pattern_file)
            events = [(e["channel"], e["note"], e["velocity"]) for e in pattern_data["events"]]
            tempo = pattern_data["metadata"]["tempo"]
            click.echo(f"Loaded pattern: {pattern_data['metadata']['style']} at {tempo} BPM", err=True)
        else:
            if not tempo:
                from rhythm_wolf.mappings import get_tempo_for_style
                tempo = get_tempo_for_style(style)
            events = generate_pattern(style=style, tempo=tempo, template=template)
            click.echo(f"Generated {style} pattern at {tempo} BPM", err=True)

        # Send pattern
        click.echo(f"\n⚠️  Make sure Rhythm Wolf is in Record Performance mode!", err=True)
        click.echo("Press Enter to send pattern...", err=True)
        input()

        sender.send_pattern(events, tempo=tempo)
        click.echo("\n✓ Pattern sent!", err=True)
        click.echo("Save it on the Rhythm Wolf: hold SHIFT + press Step 16 (SAVE)", err=True)

    finally:
        sender.disconnect()


@cli.command()
@click.option("--style", type=click.Choice(["techno", "house", "tech_house", "minimal"]),
              default="techno", help="Music style")
def info(style):
    """Show info about a style."""
    if style in TEMPO_RANGES:
        start, end = TEMPO_RANGES[style]
        click.echo(f"{style.upper()}")
        click.echo(f"  Tempo range: {start}–{end} BPM")
    else:
        click.echo(f"Unknown style: {style}")


if __name__ == "__main__":
    cli()
