import { RefreshCw } from 'lucide-react'
import { useStore } from '@/state/store'
import { Button, IconButton } from '@/components/ui/Button'
import { Tag } from '@/components/ui/Tag'
import { Led } from '@/components/hw/Led'

export function DevicePanel() {
  const { deviceState, ports, selectedPort, setSelectedPort, scanning, setScanningDevices } = useStore()

  const statusTone = {
    connected: 'accent',
    disconnected: 'neutral',
    error: 'outline',
    scanning: 'neutral',
  } as const

  const statusLabel = {
    connected: 'Connected',
    disconnected: 'No device',
    error: 'Device error',
    scanning: 'Scanning...',
  } as const

  const helpText = {
    connected: 'Ready. Patterns send on MIDI channel 10.',
    disconnected: "Couldn't find Rhythm Wolf. Make sure it's connected via USB and powered on, then refresh.",
    error: 'Rhythm Wolf stopped responding. Unplug the USB cable, reconnect, then refresh.',
    scanning: 'Scanning MIDI ports...',
  } as const

  const handleRefresh = async () => {
    setScanningDevices(true)
    // In production, call backend API to list devices
    setTimeout(() => setScanningDevices(false), 1200)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="kicker">MIDI Output</div>
        <Tag tone={statusTone[deviceState]}>{statusLabel[deviceState]}</Tag>
      </div>

      <div className="space-y-2">
        <select
          value={selectedPort || ''}
          onChange={(e) => setSelectedPort(e.target.value || null)}
          className="input w-full"
          disabled={scanning}
        >
          <option value="">Select device...</option>
          {ports.map((port) => (
            <option key={port.id} value={port.id}>
              {port.name}
            </option>
          ))}
        </select>

        <IconButton onClick={handleRefresh} disabled={scanning} ariaLabel="Refresh devices">
          <RefreshCw size={18} className={scanning ? 'animate-spin' : ''} />
        </IconButton>
      </div>

      <div className="text-xs text-neutral-500 p-2 bg-bg">{helpText[deviceState]}</div>
    </div>
  )
}
