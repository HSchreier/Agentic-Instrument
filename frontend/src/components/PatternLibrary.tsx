import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { type Pattern } from '@/lib/api'

interface PresetPattern {
  id: string
  name: string
  style: string
  tempo: number
  description: string
  metadata: {
    style: string
    tempo: number
    num_events: number
  }
  events: Array<{ channel: number; note: number; velocity: number; step: number }>
}

interface PatternLibraryProps {
  onPattern?: (pattern: Pattern) => void
  onSave?: (pattern: Pattern) => void
  onSend?: (pattern: Pattern) => void
}

export function PatternLibrary({ onPattern, onSend }: PatternLibraryProps) {
  const [search, setSearch] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  // Fetch presets
  const { data: presetsData = { presets: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['presets'],
    queryFn: async () => {
      const { data } = await axios.get('/api/library/presets')
      return data
    },
  })

  // Filter presets
  const filteredPresets = presetsData.presets.filter((p: PresetPattern) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.description.toLowerCase().includes(search.toLowerCase())
    const matchesStyle = !selectedStyle || p.style === selectedStyle
    return matchesSearch && matchesStyle
  })

  // Get unique styles
  const styles = [...new Set(presetsData.presets.map((p: PresetPattern) => p.style))]

  const handleSelectPattern = (preset: PresetPattern) => {
    const pattern: Pattern = {
      metadata: preset.metadata,
      events: preset.events.map(e => ({
        channel: e.channel,
        note: e.note,
        velocity: e.velocity,
      })),
    }
    if (onPattern) {
      onPattern(pattern)
    }
  }

  const handleSendPattern = (preset: PresetPattern) => {
    const pattern: Pattern = {
      metadata: preset.metadata,
      events: preset.events.map(e => ({
        channel: e.channel,
        note: e.note,
        velocity: e.velocity,
      })),
    }
    if (onSend) {
      onSend(pattern)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">📚 Pattern Library</h2>
        <p className="text-blue-100">{presetsData.total} preset patterns ready to use</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns by name or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Style</label>
          <select
            value={selectedStyle || ''}
            onChange={(e) => setSelectedStyle(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Styles</option>
            {styles.map((style) => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Presets Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading presets...</p>
        </div>
      ) : filteredPresets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No patterns found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset: PresetPattern) => (
            <div
              key={preset.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 space-y-3"
            >
              {/* Pattern Info */}
              <div>
                <h3 className="font-bold text-gray-900">{preset.name}</h3>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </div>

              {/* Metadata */}
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {preset.style}
                </span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {preset.tempo} BPM
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  {preset.metadata.num_events} events
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => handleSelectPattern(preset)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                >
                  📂 Load
                </button>
                <button
                  onClick={() => handleSendPattern(preset)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                >
                  🚀 Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        Showing {filteredPresets.length} of {presetsData.total} patterns
      </div>
    </div>
  )
}
