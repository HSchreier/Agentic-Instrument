interface StepPadProps {
  velocity: number // 0-127
  group: 0 | 1 | 2 | 3 // For alternating colors
  isPlayhead: boolean
  level: number // 0-100 for scaling
  mode: 'bars' | 'opacity'
  onCycle: () => void
  ariaLabel: string
}

export function StepPad({
  velocity,
  group,
  isPlayhead,
  level,
  mode,
  onCycle,
  ariaLabel,
}: StepPadProps) {
  // Determine background color by group
  const bgColors = {
    0: 'bg-neutral-700',
    1: 'bg-neutral-800',
    2: 'bg-neutral-700',
    3: 'bg-neutral-800',
  }

  const isOn = velocity > 0
  let fillOpacity = 0.4 // minimum
  let fillHeight = 0 // for bars mode

  if (isOn) {
    const velocityFactor = velocity / 127
    const levelFactor = level / 100

    if (mode === 'bars') {
      // Height based on velocity
      fillHeight = velocityFactor * 100
      // Opacity based on level
      fillOpacity = Math.max(0.4, levelFactor)
    } else {
      // Opacity based on velocity and level
      fillOpacity = 0.3 + 0.7 * velocityFactor
      fillOpacity *= Math.max(0.4, levelFactor)
    }
  }

  return (
    <button
      onClick={onCycle}
      className={`relative h-9 overflow-hidden transition-colors ${bgColors[group]} hover:bg-neutral-600`}
      style={{
        minWidth: '34px',
      }}
      aria-label={ariaLabel}
    >
      {isPlayhead && (
        <div className="absolute inset-0 border-2 border-bg pointer-events-none" />
      )}

      {isOn && (
        <div
          className="absolute bg-accent transition-all"
          style={{
            bottom: '3px',
            left: '3px',
            right: '3px',
            height: mode === 'bars' ? `${fillHeight}%` : '100%',
            opacity: fillOpacity,
          }}
        />
      )}
    </button>
  )
}
