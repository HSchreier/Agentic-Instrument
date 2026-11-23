import { useState } from 'react'
import { useStore } from '@/state/store'
import { cycleVelocity, eventCount, STYLES, generateUniversal } from '@/lib/adapters'
import { Button } from '@/components/ui/Button'
import { Knob } from '@/components/hw/Knob'
import { Lcd } from '@/components/hw/Lcd'
import { SequencerGrid } from '@/components/hw/SequencerGrid'
import { MiniGrid } from '@/components/hw/MiniGrid'
import { MachineSelector } from '@/components/hw/MachineSelector'
import { PageButtons } from '@/components/hw/PageButtons'
import { Menu, X } from 'lucide-react'

export function GenerateView() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)

  const {
    style,
    setStyle,
    template,
    setTemplate,
    bpm,
    setBpm,
    bass,
    setBass,
    setSeed,
    pattern,
    setPattern,
    undo,
    undoLast,
    clearPattern,
    patternName,
    setPatternName,
    addToast,
  } = useStore()

  const handleGenerate = () => {
    const newSeed = Math.floor(Math.random() * 1000000)
    setSeed(newSeed)
    const newPattern = generateUniversal(style, template, bass, newSeed)
    setPattern(newPattern)
    addToast('success', 'Pattern created', 'Send it to your device or edit the steps here.')
  }

  const handleCycleStep = (row: number, step: number) => {
    const newPattern = pattern.map((r) => [...r])
    newPattern[row][step] = cycleVelocity(newPattern[row][step])
    setPattern(newPattern)
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Mobile Sidebar Toggle */}
      <div className="desktop:hidden flex items-center gap-2 p-4 border-b border-neutral-700">
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="p-2 hover:bg-neutral-700 rounded transition-colors"
          aria-label="Toggle controls panel"
        >
          {leftSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-sm font-semibold">Controls</span>
      </div>

      <div className="flex-1 overflow-hidden grid desktop:grid-cols-[300px_1fr] gap-0">
        {/* Left Sidebar - Controls Panel */}
        <div
          className={`
            desktop:block
            ${leftSidebarOpen ? 'block' : 'hidden'}
            absolute desktop:relative
            left-0 top-16 desktop:top-0
            w-full desktop:w-auto
            h-[calc(100vh-64px)] desktop:h-auto
            bg-bg desktop:bg-transparent
            z-40 desktop:z-auto
            overflow-y-auto
            border-r border-neutral-700 desktop:border-r-rule
            transition-all duration-300 ease-in-out
            -translate-x-full desktop:translate-x-0
            ${leftSidebarOpen ? 'translate-x-0' : ''}
          `}
          style={{
            transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <div className="space-y-6 p-6 desktop:p-0">
        {/* Style Selection */}
        <div>
          <div className="kicker">01 — Style</div>
          <div className="grid grid-cols-2 gap-1">
            {(['Techno', 'House', 'Tech House', 'Minimal', 'D&B'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`btn h-11 text-xs font-semibold ${
                  style === s ? 'bg-ink text-bg' : 'bg-bg border-rule border-ink'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tempo */}
        <div className="border-t-rule border-t-rule pt-6">
          <div className="kicker">02 — Tempo</div>
          <div className="text-5xl font-black leading-none mb-4">
            {String(bpm).padStart(3, '0')}
            <span className="text-xs font-semibold text-neutral-500 ml-1">BPM</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="text-xs text-neutral-500 mt-2">
            {style} sits at {STYLES[style].min}–{STYLES[style].max} BPM
          </div>
        </div>

        {/* Template */}
        <div className="border-t-rule border-t-rule pt-6">
          <div className="kicker">03 — Template</div>
          <div className="space-y-1">
            {(['Four on the Floor', 'Half Time', 'Minimal'] as const).map((t) => (
              <label key={t} className="flex items-center gap-3 p-2 cursor-pointer">
                <input
                  type="radio"
                  name="template"
                  value={t}
                  checked={template === t}
                  onChange={() => setTemplate(t)}
                  className="w-3 h-3"
                />
                <span className="text-sm font-semibold">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bass Synth */}
        <div className="border-t-rule border-t-rule pt-6">
          <div className="kicker">04 — Bass Synth</div>
          <label className="flex items-center gap-3 p-2 cursor-pointer bg-bg border-rule border-ink">
            <div className={`w-3 h-3 rounded-full ${bass ? 'bg-accent' : 'bg-neutral-300'}`} />
            <span className="text-sm font-semibold">{bass ? 'ON' : 'OFF'}</span>
            <input
              type="checkbox"
              checked={bass}
              onChange={() => setBass(!bass)}
              className="hidden"
            />
          </label>
        </div>

        {/* Generate Button */}
        <div className="border-t-rule border-t-rule pt-6">
          <Button block variant="primary" onClick={handleGenerate} className="h-11">
            Generate pattern →
          </Button>
        </div>
          </div>
        </div>

        {/* Main Content Area - Faceplate & Sequencer */}
        <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {/* Top bar with LCD and knobs */}
        <div className="bg-ink text-bg p-6 shadow-md rounded-none flex justify-between items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Rhythm Wolf
            </div>
            <div className="text-xs text-neutral-400 uppercase tracking-widest">
              Analog Drum Machine & Bass Synth · MIDI
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs font-bold uppercase text-neutral-400 mb-1">Tempo</div>
              <Lcd value={String(bpm).padStart(3, '0')} />
            </div>
            <Knob
              value={bpm}
              min={20}
              max={300}
              label="Tempo"
              onChange={setBpm}
              indicator="accent"
              ariaLabel="Adjust tempo"
              size={44}
            />
            <button className="w-16 h-16 bg-neutral-800 border-2 border-neutral-500 flex items-center justify-center text-bg text-2xl">
              ▶
            </button>
          </div>
        </div>

        {/* Device selector and controls */}
        <MachineSelector />

        {/* Sequencer Grid */}
        <div className="bg-ink p-6">
          <SequencerGrid
            pattern={pattern}
            playStep={null}
            onCycle={handleCycleStep}
          />
        </div>

        {/* Page navigation for multi-page devices */}
        <PageButtons />

        {/* Footer info and buttons */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
          <div>Click a step to cycle: accent → soft → off. Drag knobs vertically.</div>
          <div>{eventCount(pattern)} EVENTS · 1 BAR · 16 STEPS</div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={undo.length === 0}
            onClick={undoLast}
            className="text-sm"
          >
            ↶ Undo
          </Button>
          <Button variant="secondary" onClick={clearPattern} className="text-sm">
            Clear
          </Button>
          <Button variant="ghost" className="text-sm">
            Re-roll variation
          </Button>
          <input
            type="text"
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            placeholder="Pattern name"
            className="input text-sm flex-1"
          />
        </div>

        {/* Preview mini-grid */}
        <div className="border-rule border-rule p-4 bg-bg">
          <div className="text-xs font-bold uppercase tracking-wider mb-3">Preview</div>
          <MiniGrid pattern={pattern} cellSize={8} />
        </div>
        </div>
      </div>
    </div>
  )
}
