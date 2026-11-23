import { StepPad } from './StepPad'
import type { Adapter, UniversalPattern } from '@/lib/adapters'
import { ADAPTERS, toDevice } from '@/lib/adapters'
import { useStore } from '@/state/store'

interface SequencerGridProps {
  adapter?: Adapter
  pattern?: UniversalPattern
  playStep: number | null
  onCycle?: (voiceIdx: number, step: number) => void
}

export function SequencerGrid({ adapter, pattern, playStep, onCycle }: SequencerGridProps) {
  const store = useStore()
  const selectedAdapter = adapter || ADAPTERS.find((a) => a.id === store.deviceId)!
  const displayPattern = pattern || store.pattern
  const { view, page, deviceMuted } = store

  const devicePattern = view === 'device' ? toDevice(displayPattern, selectedAdapter) : null
  const rows = devicePattern || displayPattern
  const offset = page * 16
  const steps = Math.min(16, selectedAdapter.steps - offset)
  const pageSteps = Math.min(4, Math.ceil(steps / 4))

  const handleCycle = (voiceIdx: number, step: number) => {
    if (!onCycle) return
    const globalStep = offset + step
    onCycle(voiceIdx, globalStep)
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-3">
        {/* Voice labels column */}
        <div>
          <div className="h-20 flex items-end pb-2 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Voice</span>
          </div>
          <div className="flex flex-col">
            {selectedAdapter.voices.map((voice, idx) => {
              const isMuted = deviceMuted[`${selectedAdapter.id}:${idx}`]
              return (
                <div
                  key={idx}
                  className={`h-9 flex items-center px-3 border-b border-neutral-700 ${isMuted ? 'opacity-35' : ''}`}
                >
                  <div className="text-xs font-bold">{voice.name}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step groups */}
        {[0, 1, 2, 3].map((groupIdx) => {
          if (groupIdx >= pageSteps) return null
          return (
            <div key={groupIdx} className="flex flex-col gap-1">
              {/* Group header */}
              <div className="h-20 flex items-end justify-around px-1">
                {[0, 1, 2, 3].map((stepInGroup) => {
                  const stepIdx = groupIdx * 4 + stepInGroup
                  if (stepIdx >= steps) return null
                  return (
                    <div key={stepInGroup} className="text-xs font-bold text-neutral-400">
                      {offset + stepIdx + 1}
                    </div>
                  )
                })}
              </div>

              {/* Step pads */}
              <div className="flex flex-col gap-1">
                {rows.map((voiceRow, voiceIdx) => (
                  <div
                    key={voiceIdx}
                    className="flex gap-1"
                    style={{
                      borderTop: voiceIdx === 0 ? '2px solid #605d5d' : 'none',
                      borderBottom:
                        voiceIdx === rows.length - 1 ? '2px solid #605d5d' : '1px solid #605d5d',
                    }}
                  >
                    {[0, 1, 2, 3].map((stepInGroup) => {
                      const stepIdx = groupIdx * 4 + stepInGroup
                      if (stepIdx >= steps) return null

                      const globalStep = offset + stepIdx
                      const velocity = voiceRow[globalStep] || 0
                      const isPlayhead = playStep === globalStep
                      const isMuted = deviceMuted[`${selectedAdapter.id}:${voiceIdx}`]

                      return (
                        <StepPad
                          key={stepIdx}
                          velocity={velocity}
                          group={groupIdx % 2 === 0 ? (voiceIdx % 2 === 0 ? 0 : 1) : (voiceIdx % 2 === 0 ? 2 : 3)}
                          isPlayhead={isPlayhead}
                          level={isMuted ? 40 : 100}
                          mode="bars"
                          onCycle={() => handleCycle(voiceIdx, stepIdx)}
                          ariaLabel={`${selectedAdapter.voices[voiceIdx].name} step ${globalStep + 1}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
