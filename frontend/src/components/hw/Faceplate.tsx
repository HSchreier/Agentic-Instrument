import { useStore } from '@/state/store'
import { ADAPTERS } from '@/lib/adapters'
import type { Adapter } from '@/lib/adapters'
import { Knob } from './Knob'
import { VoiceLabel } from './VoiceLabel'

interface FaceplateProps {
  adapter?: Adapter
}

export function Faceplate({ adapter }: FaceplateProps) {
  const store = useStore()
  const selectedAdapter = adapter || ADAPTERS.find((a) => a.id === store.deviceId)!

  const renderStrips = () => {
    return selectedAdapter.voices.map((_, idx) => {
      const baseKey = `${selectedAdapter.id}:${idx}`
      const isMuted = store.deviceMuted[baseKey]
      const stripKnobs = [
        { name: 'Level', key: `${baseKey}:0`, default: 100 },
        { name: 'Decay', key: `${baseKey}:1`, default: 50 },
      ]

      return (
        <div
          key={idx}
          className="flex flex-col items-center gap-3 p-3 border border-neutral-700 rounded bg-neutral-800"
        >
          <VoiceLabel adapter={selectedAdapter} voiceIndex={idx} onClick={() => store.toggleDeviceMute(selectedAdapter.id, idx)} />

          <div className="flex flex-col gap-2">
            {stripKnobs.map((knob) => {
              const value = store.knobs[knob.key] ?? knob.default
              return (
                <div key={knob.name} className="flex flex-col items-center gap-1">
                  <Knob
                    value={value}
                    onChange={(v) => {
                      const [deviceId, voiceIdx, knobIdx] = knob.key.split(':')
                      store.setKnob(deviceId, parseInt(voiceIdx), parseInt(knobIdx), v)
                    }}
                    min={0}
                    max={100}
                    size={36}
                    label={knob.name}
                    ariaLabel={`${selectedAdapter.voices[idx].name} ${knob.name}`}
                  />
                  <div className="text-xs text-neutral-400 font-semibold">{Math.round(value)}%</div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => store.toggleDeviceMute(selectedAdapter.id, idx)}
            className={`w-full py-1 rounded text-xs font-bold transition-all ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {isMuted ? 'MUTED' : 'UNMUTED'}
          </button>
        </div>
      )
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-neutral-400 mb-4">Faceplate Controls</h3>
        <div className={`grid gap-4 ${selectedAdapter.voices.length > 8 ? 'grid-cols-4' : 'grid-cols-2'}`}>
          {renderStrips()}
        </div>
      </div>
    </div>
  )
}
