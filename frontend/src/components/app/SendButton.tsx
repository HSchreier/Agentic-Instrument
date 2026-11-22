import { useStore } from '@/state/store'
import { eventCount, estimateSendMs } from '@/lib/pattern'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'

export function SendButton() {
  const {
    pattern,
    patternName,
    bpm,
    selectedPort,
    deviceState,
    sendConfirmOpen,
    setSendConfirmOpen,
    sending,
    addToast,
    setSending,
    setSendProgress,
  } = useStore()

  const events = eventCount(pattern)
  const estimatedMs = estimateSendMs(events)
  const estimatedSecs = Math.round(estimatedMs / 1000)

  const isDisabled =
    !selectedPort || deviceState !== 'connected' || events === 0 || sending

  const handleSend = async () => {
    if (isDisabled) return

    setSending(true)
    setSendProgress(0)

    // Simulate send progress
    const interval = setInterval(() => {
      setSendProgress((p) => Math.min(p + Math.random() * 20, 90))
    }, 100)

    // Simulate send completion
    setTimeout(() => {
      clearInterval(interval)
      setSendProgress(100)
      setSending(false)
      setSendConfirmOpen(false)
      addToast(
        'success',
        'Sent to Rhythm Wolf',
        `${events} events in ${estimatedSecs}s · ${patternName}`
      )
    }, estimatedMs)
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
        title="Send to Rhythm Wolf?"
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
