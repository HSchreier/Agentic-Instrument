import type { Pattern } from '@/lib/pattern'

interface MiniGridProps {
  pattern: Pattern
  cellSize?: 6 | 8 | 16
}

export function MiniGrid({ pattern, cellSize = 8 }: MiniGridProps) {
  const sizeClasses = {
    6: 'w-1 h-1 gap-0.5',
    8: 'w-2 h-2 gap-1',
    16: 'w-4 h-4 gap-2',
  }

  return (
    <div
      className={`inline-grid border-rule border-ink bg-ink p-2`}
      style={{
        gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
        gap: cellSize === 6 ? '2px' : cellSize === 8 ? '4px' : '8px',
      }}
    >
      {pattern.map((row) =>
        row.map((velocity, stepIdx) => {
          const opacity = velocity === 0 ? 0 : 0.35 + (0.65 * velocity) / 127
          return (
            <div
              key={stepIdx}
              className={`${sizeClasses[cellSize]} bg-accent`}
              style={{ opacity }}
            />
          )
        })
      )}
    </div>
  )
}
