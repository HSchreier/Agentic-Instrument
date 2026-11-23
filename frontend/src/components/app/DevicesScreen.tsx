import { useStore } from '@/state/store'
import { ADAPTERS } from '@/lib/adapters'
import { Led } from '@/components/hw/Led'

export function DevicesScreen() {
  const store = useStore()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Available Devices</h2>
        <div className="grid grid-cols-1 gap-4">
          {ADAPTERS.map((adapter) => {
            const isDetected = store.detected[adapter.id]
            const isSelected = store.deviceId === adapter.id

            return (
              <button
                key={adapter.id}
                onClick={() => store.setDeviceId(adapter.id)}
                className={`p-4 rounded border-2 transition-all text-left ${
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Led on={isDetected} tone="accent" size={10} />
                    <div>
                      <h3 className="font-bold text-sm">{adapter.name}</h3>
                      <p className="text-xs text-neutral-400">{adapter.id}</p>
                    </div>
                  </div>
                  {isSelected && <span className="text-xs font-bold text-accent">SELECTED</span>}
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs mt-3 pt-3 border-t border-neutral-700">
                  <div>
                    <div className="text-neutral-400 font-semibold">Voices</div>
                    <div className="font-bold">{adapter.voices.length}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400 font-semibold">Steps</div>
                    <div className="font-bold">{adapter.steps}</div>
                  </div>
                  <div>
                    <div className="text-neutral-400 font-semibold">Pages</div>
                    <div className="font-bold">{adapter.pages}</div>
                  </div>
                </div>

                {adapter.channel !== undefined && (
                  <div className="text-xs mt-3 pt-3 border-t border-neutral-700">
                    <span className="text-neutral-400 font-semibold">Channel: </span>
                    <span className="font-bold">{adapter.channel}</span>
                  </div>
                )}

                {adapter.pitched && (
                  <div className="text-xs mt-2 text-accent font-semibold">
                    ♪ Pitched (Melodic)
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-neutral-700 pt-6">
        <h3 className="text-sm font-bold mb-3 text-neutral-400">Device Status</h3>
        <div className="space-y-2 text-xs">
          {ADAPTERS.map((adapter) => {
            const isDetected = store.detected[adapter.id]
            return (
              <div key={adapter.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded">
                <span className="font-semibold">{adapter.name}</span>
                <div className="flex items-center gap-2">
                  <Led on={isDetected} tone="accent" size={8} />
                  <span className={isDetected ? 'text-green-400' : 'text-neutral-500'}>
                    {isDetected ? 'Connected' : 'Offline'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
