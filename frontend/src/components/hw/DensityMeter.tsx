import { density } from '@/lib/pattern'

interface DensityMeterProps {
  events: number
}

export function DensityMeter({ events }: DensityMeterProps) {
  const dens = density(events)
  const levels = [6, 10, 14] // px heights
  const active = dens === 'Dense' ? 2 : dens === 'Medium' ? 1 : 0

  return (
    <div className="flex items-end gap-1">
      {levels.map((h, idx) => (
        <div
          key={idx}
          className={`w-1 transition-colors ${idx <= active ? 'bg-ink' : 'bg-neutral-300'}`}
          style={{ height: `${h}px` }}
        />
      ))}
      <span className="text-xs text-neutral-400 ml-1">
        {dens} · {events} events
      </span>
    </div>
  )
}
