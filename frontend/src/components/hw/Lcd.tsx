interface LcdProps {
  value: string
}

export function Lcd({ value }: LcdProps) {
  return (
    <div
      className="font-mono font-bold text-accent text-2xl px-3 py-1.5 min-w-24"
      style={{
        backgroundColor: '#000000',
        fontFamily: 'Courier, monospace',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.06em',
      }}
    >
      {value}
    </div>
  )
}
