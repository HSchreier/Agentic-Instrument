import { type Pattern } from '@/lib/api'

interface Props {
  pattern: Pattern
}

const drumNames: Record<number, string> = {
  36: 'Kick',
  38: 'Snare',
  40: 'Percussion',
  42: 'Hi-hat Open',
  44: 'Hi-hat Closed',
}

export function PatternPreview({ pattern }: Props) {
  const { metadata, events } = pattern

  // Group events by drum sound
  const eventsByNote = events.reduce(
    (acc, event) => {
      if (!acc[event.note]) acc[event.note] = []
      acc[event.note].push(event)
      return acc
    },
    {} as Record<number, typeof events>,
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Pattern Preview</h2>

      {/* Metadata */}
      <div className="bg-gray-50 rounded p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Style</p>
            <p className="font-semibold text-gray-900 capitalize">{metadata.style}</p>
          </div>
          <div>
            <p className="text-gray-600">Tempo</p>
            <p className="font-semibold text-gray-900">{metadata.tempo} BPM</p>
          </div>
          <div>
            <p className="text-gray-600">Events</p>
            <p className="font-semibold text-gray-900">{metadata.num_events}</p>
          </div>
        </div>
      </div>

      {/* Drums breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Drum Sounds</h3>
        {Object.entries(eventsByNote).map(([note, noteEvents]) => (
          <div key={note} className="border-l-4 border-blue-500 pl-4">
            <p className="font-medium text-gray-900">{drumNames[parseInt(note)] || `Note ${note}`}</p>
            <p className="text-sm text-gray-600">{noteEvents.length} events</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {noteEvents.map((event, i) => (
                <span
                  key={i}
                  className={`inline-block w-6 h-6 rounded text-center text-xs leading-6 font-bold text-white ${
                    event.velocity === 127
                      ? 'bg-red-500'
                      : event.velocity === 84
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  title={`Velocity: ${event.velocity}`}
                >
                  •
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Soft: <span className="text-green-600">●</span> Medium:{' '}
              <span className="text-yellow-600">●</span> Accent: <span className="text-red-600">●</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
