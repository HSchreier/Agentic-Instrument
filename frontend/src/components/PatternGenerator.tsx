import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { generatePattern, getStyles, getTemplates, type GenerateRequest, type Pattern } from '@/lib/api'

interface Props {
  onGenerate: (pattern: Pattern | null) => void
}

export function PatternGenerator({ onGenerate }: Props) {
  const [style, setStyle] = useState('techno')
  const [tempo, setTempo] = useState(128)
  const [template, setTemplate] = useState('four_on_the_floor')
  const [includeBass, setIncludeBass] = useState(false)

  const { data: styles = [] } = useQuery({
    queryKey: ['styles'],
    queryFn: getStyles,
  })

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  })

  const mutation = useMutation({
    mutationFn: (request: GenerateRequest) => generatePattern(request),
    onSuccess: (pattern) => {
      onGenerate(pattern)
    },
  })

  const handleGenerate = () => {
    mutation.mutate({
      style,
      tempo: tempo || undefined,
      template,
      include_bass: includeBass,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Generate Pattern</h2>

      {/* Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {styles.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.tempo_min}–{s.tempo_max} BPM)
            </option>
          ))}
        </select>
      </div>

      {/* Tempo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tempo (BPM): <span className="text-blue-600 font-semibold">{tempo}</span>
        </label>
        <input
          type="range"
          min="20"
          max="300"
          value={tempo}
          onChange={(e) => setTempo(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20</span>
          <span>300</span>
        </div>
      </div>

      {/* Template */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Pattern Template</label>
        <select
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {templates.map((t: any) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Include Bass */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={includeBass}
          onChange={(e) => setIncludeBass(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <span className="text-sm font-medium text-gray-700">Include Bass Synth</span>
      </label>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={mutation.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
      >
        {mutation.isPending ? '⏳ Generating...' : '✨ Generate Pattern'}
      </button>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          <p className="text-sm">Error generating pattern</p>
        </div>
      )}
    </div>
  )
}
