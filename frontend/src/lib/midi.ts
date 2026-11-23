// Web MIDI API integration for device detection & communication

import { ADAPTERS, getAdapterByPort } from '@/lib/adapters'

export interface MIDIDevice {
  id: string
  name: string
  adapterId?: string
  output?: MIDIOutput
  timestamp: number
}

export class MIDIManager {
  private access: MIDIAccess | null = null
  private devices: Map<string, MIDIDevice> = new Map()
  private listeners: ((detectedDevices: MIDIDevice[]) => void)[] = []

  async init(): Promise<boolean> {
    try {
      this.access = await navigator.requestMIDIAccess()
      this.scanDevices()
      this.setupListeners()
      return true
    } catch (err) {
      console.error('MIDI Access denied:', err)
      return false
    }
  }

  private scanDevices() {
    if (!this.access) return

    const outputs = this.access.outputs.values()
    this.devices.clear()

    for (const output of outputs) {
      const name = output.name || 'Unknown MIDI Output'
      const adapter = getAdapterByPort(name)
      this.devices.set(output.id, {
        id: output.id,
        name,
        adapterId: adapter?.id,
        output,
        timestamp: Date.now(),
      })
    }

    this.notifyListeners()
  }

  private setupListeners() {
    if (!this.access) return

    this.access.addEventListener('statechange', (event) => {
      if (!event.port) return
      if (event.port.type === 'output') {
        const { id, state } = event.port
        const name = event.port.name || 'Unknown MIDI Output'

        if (state === 'connected') {
          const adapter = getAdapterByPort(name)
          this.devices.set(id, {
            id,
            name,
            adapterId: adapter?.id,
            output: event.port as MIDIOutput,
            timestamp: Date.now(),
          })
        } else if (state === 'disconnected') {
          this.devices.delete(id)
        }

        this.notifyListeners()
      }
    })
  }

  private notifyListeners() {
    const detectedList = Array.from(this.devices.values())
    this.listeners.forEach((listener) => listener(detectedList))
  }

  getDevices(): MIDIDevice[] {
    return Array.from(this.devices.values())
  }

  onDevicesChanged(listener: (devices: MIDIDevice[]) => void) {
    this.listeners.push(listener)
    if (this.devices.size > 0) {
      listener(this.getDevices())
    }
  }

  async sendPattern(deviceId: string, pattern: number[][]): Promise<boolean> {
    const device = this.devices.get(deviceId)
    if (!device?.output) {
      console.warn(`Device ${deviceId} not found or offline`)
      return false
    }

    try {
      const output = device.output
      const adapter = ADAPTERS.find((a) => a.id === device.adapterId)
      if (!adapter) return false

      // Send pattern: for each voice/track
      for (let voiceIdx = 0; voiceIdx < pattern.length; voiceIdx++) {
        const voicePattern = pattern[voiceIdx]
        const voice = adapter.voices[voiceIdx]
        if (!voice) continue

        // Send note-ons for each step with velocity
        for (let step = 0; step < voicePattern.length; step++) {
          const velocity = voicePattern[step]
          if (velocity > 0) {
            // Note on: status 0x90 | channel
            const channelNum = parseInt(adapter.channel.split('–')[0]) - 1
            const status = 0x90 | Math.max(0, channelNum)
            const note = voice.note ?? (36 + step) // Default to GM drum map

            output.send([status, note, velocity])
          }
        }
      }

      return true
    } catch (err) {
      console.error('Failed to send pattern:', err)
      return false
    }
  }

  async close() {
    this.devices.clear()
    this.listeners = []
    this.access = null
  }
}

export const midiManager = new MIDIManager()
