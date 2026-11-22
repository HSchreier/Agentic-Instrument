import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useStore } from '@/state/store'
import { generate, eventCount, density, STYLES } from '@/lib/pattern'
import { Button } from '@/components/ui/Button'
import { MiniGrid } from '@/components/hw/MiniGrid'
import { DensityMeter } from '@/components/hw/DensityMeter'
import { Star } from 'lucide-react'

interface Preset {
  id: string
  name: string
  style: string
  bpm: number
  template: string
  bass: boolean
  seed: number
  description: string
}

export function LibraryView() {
  const { setPattern, setStyle, setBpm, setTemplate, setBass, setSeed, setTab, favorites, toggleFavorite, libraryQuery, setLibraryQuery } = useStore()
  const [filter, setFilter] = useState<string>('All')
  const [sort, setSort] = useState<'name' | 'tempo' | 'style'>('name')

  const { data: presets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      const { data } = await axios.get('/api/library/presets')
      return data.presets || []
    },
  })

  const styles = useMemo(() => {
    const unique = new Set(presets.map((p: Preset) => p.style))
    return Array.from(unique).sort()
  }, [presets])

  const filtered = useMemo(() => {
    let result = presets.filter((p: Preset) => {
      const matchSearch =
        p.name.toLowerCase().includes(libraryQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(libraryQuery.toLowerCase())
      const matchFilter = filter === 'All' || filter === '★' ? true : p.style === filter
      return matchSearch && matchFilter
    })

    return result.sort((a: Preset, b: Preset) => {
      switch (sort) {
        case 'tempo':
          return a.bpm - b.bpm
        case 'style':
          return a.style.localeCompare(b.style)
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [presets, libraryQuery, filter, sort])

  const handleLoad = (preset: Preset) => {
    const style = normalizeStyle(preset.style)
    setStyle(style)
    setBpm(preset.bpm)
    setTemplate(preset.template as any)
    setBass(preset.bass)
    setSeed(preset.seed)
    const pattern = generate(style, preset.template as any, preset.bass, preset.seed)
    setPattern(pattern)
    setTab('Generate')
  }

  const normalizeStyle = (style: string): any => {
    const map: Record<string, any> = {
      'Acid': 'House',
      'Ambient': 'Minimal',
      'Berlin': 'Techno',
      'Deep House': 'House',
      'Electro': 'Tech House',
      'Minimal': 'Minimal',
      'Techno': 'Techno',
    }
    return map[style] || 'Techno'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2">📚 Pattern Library</h1>
        <p className="text-sm text-neutral-500">
          {filtered.length} of {presets.length} patterns
        </p>
      </div>

      {/* Search & Controls */}
      <div className="space-y-4 border-rule border-rule p-4 bg-bg">
        <input
          type="text"
          placeholder="Search patterns by name or description..."
          value={libraryQuery}
          onChange={(e) => setLibraryQuery(e.target.value)}
          className="input w-full"
        />

        <div className="flex gap-2 flex-wrap">
          {['All', ...styles].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 text-sm font-semibold border-rule border-ink transition ${
                filter === s ? 'bg-ink text-bg' : 'bg-bg text-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <label className="text-sm">Sort:</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="input text-sm">
            <option value="name">Name</option>
            <option value="tempo">Tempo</option>
            <option value="style">Style</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-rule border-t-rule border-l-rule">
        {filtered.length === 0 ? (
          <div className="col-span-full p-6 bg-bg text-center text-neutral-500">
            No presets match your search
          </div>
        ) : (
          filtered.map((preset: Preset) => {
            const pattern = generate(preset.style as any, preset.template as any, preset.bass, preset.seed)
            const events = eventCount(pattern)
            const isFavorite = favorites.includes(preset.id)

            return (
              <div key={preset.id} className="border-r-rule border-b-rule p-4 space-y-3 bg-bg hover:bg-surface transition">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-neutral-500 font-semibold">
                      {preset.style} · {preset.bpm} BPM
                    </div>
                    <h3 className="font-bold text-lg">{preset.name}</h3>
                  </div>
                  <button
                    onClick={() => toggleFavorite(preset.id)}
                    className="text-xl"
                  >
                    {isFavorite ? '⭐' : '☆'}
                  </button>
                </div>

                {/* Mini Grid */}
                <div className="bg-ink p-2">
                  <MiniGrid pattern={pattern} cellSize={6} />
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600">{preset.description}</p>

                {/* Density */}
                <DensityMeter events={events} />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 text-sm"
                    onClick={() => handleLoad(preset)}
                  >
                    📂 Load
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 text-sm"
                    onClick={() => {
                      handleLoad(preset)
                      // Send happens via device rail
                    }}
                  >
                    🚀 Send
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
