import { useStore } from '@/state/store'
import { eventCount, estimateSendMs, toDevice } from '@/lib/adapters'
import { ADAPTERS } from '@/lib/adapters'
import { midiManager } from '@/lib/midi'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

export function SendButton() {
  const {
    pattern,
    patternName,
    bpm,
    deviceId,
    deviceState,
    detected,
    sendConfirmOpen,
    setSendConfirmOpen,
    sending,
    addToast,
    setSending,
    setSendProgress,
  } = useStore()

  const adapter = ADAPTERS.find((a) => a.id === deviceId)
  const isDeviceDetected = detected[deviceId]

  const events = eventCount(pattern)
  const estimatedMs = estimateSendMs(events)
  const estimatedSecs = Math.round(estimatedMs / 1000)

  const isDisabled =
    !adapter || !isDeviceDetected || deviceState !== 'connected' || events === 0 || sending

  const handleSend = async () => {
    if (isDisabled || !adapter) return

    setSending(true)
    setSendProgress(0)

    try {
      // Convert universal pattern to device-specific format
      const devicePattern = toDevice(pattern, adapter)

      // Send via Web MIDI
      const success = await midiManager.sendPattern(deviceId, devicePattern)

      if (success) {
        // Simulate progress to completion
        let currentProgress = 0
        const interval = setInterval(() => {
          currentProgress = Math.min(currentProgress + Math.random() * 25, 95)
          setSendProgress(currentProgress)
        }, 50)

        setTimeout(() => {
          clearInterval(interval)
          setSendProgress(100)
          setSending(false)
          setSendConfirmOpen(false)
          addToast(
            'success',
            `Sent to ${adapter.name}`,
            `${events} events in ${estimatedSecs}s · ${patternName}`
          )
        }, 500)
      } else {
        setSending(false)
        addToast(
          'error',
          'Send failed',
          `Could not reach ${adapter.name}. Check connection.`
        )
      }
    } catch (err) {
      setSending(false)
      addToast('error', 'Send error', String(err))
    }
  }

  return (
    <>
      <Button
        variant="primary"
        block
        disabled={isDisabled}
        onClick={() => setSendConfirmOpen(true)}
        className="h-16 text-lg"
      >
        Send {events} Events →
      </Button>

      <Dialog
        open={sendConfirmOpen}
        title={`Send to ${adapter?.name}?`}
        onClose={() => setSendConfirmOpen(false)}
        actions={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: () => setSendConfirmOpen(false),
          },
          {
            label: `Send ${events} Events →`,
            variant: 'primary',
            onClick: handleSend,
          },
        ]}
      >
        <div className="space-y-3 text-sm">
          <p>
            Sending <strong>{events} events</strong> of <strong>"{patternName}"</strong> at{' '}
            <strong>{bpm} BPM</strong>.
          </p>
          <p>Estimated <strong>{estimatedSecs} seconds</strong>.</p>
          <p className="text-neutral-600">
            The current pattern slot on the device will be overwritten.
          </p>
        </div>
      </Dialog>
    </>
  )
}
