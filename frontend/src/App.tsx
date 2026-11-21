import { useState } from 'react'
import { PatternGenerator } from './components/PatternGenerator'
import { DeviceSelector } from './components/DeviceSelector'
import { PatternPreview } from './components/PatternPreview'
import { PatternSender } from './components/PatternSender'

export default function App() {
  const [pattern, setPattern] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-rhythm-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎹</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rhythm Wolf MIDI</h1>
              <p className="text-sm text-gray-500">Generate and send drum patterns to your hardware</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Generator */}
          <div className="lg:col-span-1">
            <PatternGenerator onGenerate={setPattern} />
          </div>

          {/* Center: Preview */}
          <div className="lg:col-span-1">
            {pattern ? (
              <PatternPreview pattern={pattern} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
                <p>Generate a pattern to preview</p>
              </div>
            )}
          </div>

          {/* Right: Send */}
          <div className="lg:col-span-1 space-y-6">
            <DeviceSelector onSelect={setSelectedDevice} />
            {pattern && selectedDevice && (
              <PatternSender
                pattern={pattern}
                device={selectedDevice}
                isLoading={isSending}
                onStatusChange={setIsSending}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>Built with React + TypeScript + Tailwind CSS</p>
          <p className="mt-2">
            <a href="https://github.com/HSchreier/Rythm-Wolf-Midi-PAtchre" className="hover:text-white">
              GitHub Repository
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
