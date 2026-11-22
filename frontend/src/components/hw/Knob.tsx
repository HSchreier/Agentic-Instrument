import { useRef, useEffect, useState } from 'react'

interface KnobProps {
  value: number
  min: number
  max: number
  label: string
  onChange: (value: number) => void
  size?: 36 | 44
  indicator?: 'ground' | 'accent'
  ariaLabel: string
}

export function Knob({
  value,
  min,
  max,
  label,
  onChange,
  size = 44,
  indicator = 'ground',
  ariaLabel,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const range = max - min
  const normalized = (value - min) / range
  // Rotation: -135° to +135° (270° total)
  const rotation = -135 + 270 * normalized

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const startY = (e as any).startY || e.clientY
      const delta = e.clientY - startY

      // 160px of travel = full range
      const change = -(delta / 160) * range
      const newValue = Math.max(min, Math.min(max, value + change))

      onChange(newValue)
      ;(e as any).startY = e.clientY
    }

    const handleMouseUp = () => setIsDragging(false)

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, value, min, max, range, onChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    ;(e as any).startY = e.clientY
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let delta = 0
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = 1
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -1
    if (e.shiftKey) delta *= 10

    if (delta) {
      e.preventDefault()
      const newValue = Math.max(min, Math.min(max, value + delta))
      onChange(newValue)
    }
  }

  const displayValue = Math.round(value)

  return (
    <div ref={ref} className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          touchAction: 'none',
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-neutral-500"
          style={{ backgroundColor: '#2d2b2b' }}
        />

        {/* Indicator bar at top */}
        <div
          className={`absolute left-1/2 top-1 h-1 w-0.5 origin-bottom transition-transform ${
            indicator === 'accent' ? 'bg-accent' : 'bg-bg'
          }`}
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: `0 ${size / 2 - 4}px`,
          }}
        />
      </div>

      <div className="text-xs font-bold text-ink mt-1">{displayValue}</div>
    </div>
  )
}
