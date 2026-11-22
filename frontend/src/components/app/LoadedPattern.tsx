import { useStore } from '@/state/store'
import { MiniGrid } from '@/components/hw/MiniGrid'
import { eventCount } from '@/lib/pattern'

export function LoadedPattern() {
  const { pattern, patternName, sendProgress, sending } = useStore()

  const events = eventCount(pattern)

  return (
    <div className="space-y-4 border-t-rule border-t-rule pt-4">
      <div>
        <div className="kicker">Loaded Pattern</div>
        <div className="text-xl font-bold">{patternName}</div>
        <div className="text-xs text-neutral-500 mt-1">
          {events} events
        </div>
      </div>

      <div className="bg-ink p-2">
        <MiniGrid pattern={pattern} cellSize={8} />
      </div>

      {sending && (
        <div className="space-y-1">
          <div
            className="h-2 bg-surface rounded-none overflow-hidden"
          >
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${sendProgress}%` }}
            />
          </div>
          <div className="text-xs text-neutral-500">
            Sending {Math.round(sendProgress)}%...
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-500">
        {!sending ? (
          'Est. ' + Math.max(1, Math.round(events * 0.1)) + ' seconds'
        ) : (
          'Sending...'
        )}
      </div>
    </div>
  )
}
