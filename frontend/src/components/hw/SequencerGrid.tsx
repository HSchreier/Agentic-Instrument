import { StepPad } from './StepPad'
import type { Pattern, VoiceId } from '@/lib/pattern'
import { VOICES } from '@/lib/pattern'

interface SequencerGridProps {
  pattern: Pattern
  muted: Record<VoiceId, boolean>
  levels: Record<VoiceId, number>
  playStep: number | null
  mode: 'bars' | 'opacity'
  onCycle: (row: number, step: number) => void
}

export function SequencerGrid({
  pattern,
  muted,
  levels,
  playStep,
  mode,
  onCycle,
}: SequencerGridProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-3">
        {/* Step header column */}
        <div>
          <div className="h-20 flex items-end pb-2 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Step</span>
          </div>
          <div className="flex">
            {/* Voice labels column */}
            <div>
              {VOICES.map((voice) => (
                <div
                  key={voice.id}
                  className={`h-9 flex items-center px-3 border-b border-neutral-700 ${
                    muted[voice.id as VoiceId] ? 'opacity-35' : ''
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{voice.name}</div>
                    <div className="text-xs text-neutral-400 font-semibold">{voice.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step groups */}
        {[0, 1, 2, 3].map((groupIdx) => (
          <div key={groupIdx} className="flex flex-col gap-1">
            {/* Group header with step numbers */}
            <div className="h-20 flex items-end justify-around px-1">
              {[0, 1, 2, 3].map((stepInGroup) => (
                <div key={stepInGroup} className="text-xs font-bold text-neutral-400">
                  {groupIdx * 4 + stepInGroup + 1}
                </div>
              ))}
            </div>

            {/* Step pads for this group */}
            <div className="flex flex-col gap-1">
              {VOICES.map((voice, rowIdx) => (
                <div
                  key={voice.id}
                  className="flex gap-1"
                  style={{
                    borderTop: rowIdx === 0 ? '2px solid #605d5d' : 'none',
                    borderBottom: rowIdx === VOICES.length - 1 ? '2px solid #605d5d' : '1px solid #605d5d',
                  }}
                >
                  {[0, 1, 2, 3].map((stepInGroup) => {
                    const stepIdx = groupIdx * 4 + stepInGroup
                    const velocity = pattern[rowIdx][stepIdx]
                    const isPlayhead = playStep === stepIdx
                    const isMuted = muted[voice.id as VoiceId]

                    return (
                      <StepPad
                        key={stepIdx}
                        velocity={velocity}
                        group={groupIdx % 2 === 0 ? (rowIdx % 2 === 0 ? 0 : 1) : (rowIdx % 2 === 0 ? 2 : 3)}
                        isPlayhead={isPlayhead}
                        level={isMuted ? 40 : levels[voice.id as VoiceId]}
                        mode={mode}
                        onCycle={() => onCycle(rowIdx, stepIdx)}
                        ariaLabel={`${voice.name} step ${stepIdx + 1} velocity ${velocity}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
