import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

interface PatternItem {
  id: string
  name: string
  style: string
  tempo: number
  tags: string[]
  description: string
  created_at: string
  plays: number
  favorite: boolean
}

interface LibraryStats {
  total_patterns: number
  by_style: Record<string, number>
  by_tag: Record<string, number>
  total_plays: number
  favorites: number
}

export function PatternLibrary() {
  const [style, setStyle] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<PatternItem | null>(null)
  const queryClient = useQueryClient()

  // Fetch patterns
  const { data: libraryData = { patterns: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['library', style, search, favoritesOnly],
    queryFn: async () => {
      const { data } = await axios.get('/api/library/patterns', {
        params: { style, search, favorites_only: favoritesOnly },
      })
      return data
    },
  })

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['library-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/api/library/statistics')
      return data as LibraryStats
    },
  })

  // Delete pattern
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/library/patterns/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] })
      queryClient.invalidateQueries({ queryKey: ['library-stats'] })
      setSelectedPattern(null)
    },
  })

  // Toggle favorite
  const favoriteMutation = useMutation({
    mutationFn: (id: string) => axios.post(`/api/library/patterns/${id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] })
      queryClient.invalidateQueries({ queryKey: ['library-stats'] })
    },
  })

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">📚 Pattern Library</h2>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total_patterns}</p>
            <p className="text-sm text-gray-600">Patterns</p>
          </div>
          <div className="bg-purple-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.favorites}</p>
            <p className="text-sm text-gray-600">Favorites</p>
          </div>
          <div className="bg-green-50 rounded p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.total_plays}</p>
            <p className="text-sm text-gray-600">Total Plays</p>
          </div>
          <div className="bg-orange-50 rounded p-3 text-center">
            <p className="text-lg font-bold text-orange-600">{Object.keys(stats.by_style).length}</p>
            <p className="text-sm text-gray-600">Styles</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <select
              value={style || ''}
              onChange={(e) => setStyle(e.target.value || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Styles</option>
              {stats &&
                Object.entries(stats.by_style).map(([s, count]) => (
                  <option key={s} value={s}>
                    {s} ({count})
                  </option>
                ))}
            </select>
          </div>

          <label className="flex items-end gap-2 pb-2">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Favorites Only</span>
          </label>
        </div>
      </div>

      {/* Patterns Grid */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-gray-500">Loading patterns...</p>
        ) : libraryData.patterns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No patterns found</p>
        ) : (
          libraryData.patterns.map((pattern: PatternItem) => (
            <div
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern)}
              className={`p-4 border rounded-lg cursor-pointer transition ${
                selectedPattern?.id === pattern.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {pattern.name}
                    {pattern.favorite && <span className="text-yellow-500">⭐</span>}
                  </h3>
                  <p className="text-sm text-gray-500">{pattern.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    favoriteMutation.mutate(pattern.id)
                  }}
                  className="text-2xl hover:scale-110 transition"
                >
                  {pattern.favorite ? '⭐' : '☆'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {pattern.style}
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {pattern.tempo} BPM
                </span>
                {pattern.tags.map((tag) => (
                  <span key={tag} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                {pattern.plays} plays • Created {new Date(pattern.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pattern Actions */}
      {selectedPattern && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                console.log('Load pattern:', selectedPattern.id)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              📂 Load
            </button>
            <button
              onClick={() => {
                console.log('Duplicate pattern:', selectedPattern.id)
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
            >
              📋 Duplicate
            </button>
            <button
              onClick={() => {
                console.log('Quick send:', selectedPattern.id)
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
            >
              🚀 Quick Send
            </button>
            <button
              onClick={() => {
                deleteMutation.mutate(selectedPattern.id)
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
