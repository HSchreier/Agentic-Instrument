interface LedProps {
  on: boolean
  size?: 8 | 10
  tone?: 'accent' | 'ink' | 'white'
}

export function Led({ on, size = 10, tone = 'accent' }: LedProps) {
  const sizeClasses = {
    8: 'w-2 h-2',
    10: 'w-3 h-3',
  }

  const colorClasses = {
    accent: on ? 'bg-accent' : 'bg-neutral-300',
    ink: on ? 'bg-ink' : 'bg-neutral-300',
    white: on ? 'bg-white' : 'bg-neutral-300',
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full ${colorClasses[tone]} transition-colors`} />
  )
}
