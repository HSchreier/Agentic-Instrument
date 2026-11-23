import { useStore } from '@/state/store'
import { ADAPTERS } from '@/lib/adapters'
import { Led } from './Led'

export function MachineSelector() {
  const store = useStore()
  const currentAdapter = ADAPTERS.find((a) => a.id === store.deviceId)!
  const isDetected = store.detected[store.deviceId]

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-700">
      <div className="flex flex-col gap-1">
        <div className="text-xs text-neutral-400 font-semibold">DEVICE</div>
        <button
          onClick={() => store.setTab('Devices')}
          className="flex items-center gap-2 px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 transition-colors"
        >
          <Led on={isDetected} tone="accent" size={8} />
          <span className="text-sm font-bold">{currentAdapter.name}</span>
          {currentAdapter.pages > 1 && (
            <span className="text-xs text-neutral-400">({currentAdapter.pages}p)</span>
          )}
        </button>
      </div>

      {currentAdapter.channel !== undefined && (
        <div className="flex flex-col gap-1 ml-4">
          <div className="text-xs text-neutral-400 font-semibold">CH</div>
          <div className="text-sm font-bold text-accent">{currentAdapter.channel}</div>
        </div>
      )}
    </div>
  )
}
