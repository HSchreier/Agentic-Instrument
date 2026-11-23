import { useEffect, useState } from 'react'
import { useStore } from '@/state/store'
import { midiManager, type MIDIDevice } from '@/lib/midi'

export function useMIDIDevices() {
  const [devices, setDevices] = useState<MIDIDevice[]>([])
  const [initialized, setInitialized] = useState(false)
  const { setDetected, setDeviceState, addToast } = useStore()

  useEffect(() => {
    let mounted = true

    const initMIDI = async () => {
      const success = await midiManager.init()
      if (!mounted) return

      if (success) {
        setInitialized(true)
        setDeviceState('disconnected')
        addToast('info', 'Web MIDI ready', 'Scanning for connected devices...')

        // Listen for device changes
        midiManager.onDevicesChanged((newDevices) => {
          if (!mounted) return
          setDevices(newDevices)

          // Update detection status for each device found
          newDevices.forEach((device) => {
            if (device.adapterId) {
              setDetected(device.adapterId, true)
              setDeviceState('connected')
            }
          })

          // Mark adapters as disconnected if not in the list
          if (newDevices.length === 0) {
            setDeviceState('disconnected')
          }
        })
      } else {
        setDeviceState('error')
        addToast('error', 'Web MIDI unavailable', 'Your browser may not support Web MIDI.')
      }
    }

    initMIDI()

    return () => {
      mounted = false
    }
  }, [setDetected, setDeviceState, addToast])

  return { devices, initialized }
}
