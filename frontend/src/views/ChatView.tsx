import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useStore } from '@/state/store'
import { generate, eventCount } from '@/lib/pattern'
import { Button } from '@/components/ui/Button'
import { MiniGrid } from '@/components/hw/MiniGrid'

interface Message {
  id: string
  role: 'user' | 'claude'
  text: string
  pattern?: {
    name: string
    style: string
    bpm: number
    seed: number
  }
}

const QUICK_PROMPTS = [
  '🎹 Upbeat melodic pattern for progressive house',
  '🥁 Minimal techno kick drum only',
  '🎶 Deep house groove with synth bass',
  '⚡ Acid bassline with filter sweeps',
  '🌀 Ambient pad texture, sparse notes',
]

export function ChatView() {
  const { setPattern, setStyle, setBpm, setSeed, setPatternName, addToast } = useStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'claude',
      text: 'Hey! I can help you generate MIDI patterns using natural language. Describe the vibe you want, the tempo, style, or any specific musical elements, and I\'ll create a pattern for you.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    // Simulate API call to Claude
    setTimeout(() => {
      // Parse user input for pattern details (simple heuristic)
      const styleStr = text.toLowerCase().includes('house')
        ? 'Deep House'
        : text.toLowerCase().includes('techno')
          ? 'Techno'
          : 'Electro'

      const style = normalizeStyle(styleStr)

      const bpm = text.match(/(\d{2,3})\s*bpm/i)?.[1]
        ? parseInt(text.match(/(\d{2,3})\s*bpm/i)![1])
        : 120

      const seed = Math.floor(Math.random() * 10000)
      const pattern = generate(style, 'Four on the Floor', false, seed)
      const events = eventCount(pattern)

      const claudeMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'claude',
        text: `I've created a ${styleStr} pattern at ${bpm} BPM with ${events} events. The pattern uses a dynamic seed for variation. Click "Use Pattern" below to load it into the editor, or tweak the parameters there.`,
        pattern: {
          name: `${styleStr} Pattern (${bpm} BPM)`,
          style: styleStr,
          bpm,
          seed,
        },
      }
      setMessages((m) => [...m, claudeMsg])
      setLoading(false)
    }, 1200)
  }

  const normalizeStyle = (style: string) => {
    const map: Record<string, any> = {
      'Deep House': 'House',
      'Minimal': 'Minimal',
      'Techno': 'Techno',
    }
    return map[style] || 'Techno'
  }

  const handleUsePattern = (pattern: Message['pattern']) => {
    if (!pattern) return
    const style = normalizeStyle(pattern.style)
    setPatternName(pattern.name)
    setStyle(style)
    setBpm(pattern.bpm)
    setSeed(pattern.seed)
    const generatedPattern = generate(style, 'Four on the Floor', false, pattern.seed)
    setPattern(generatedPattern)
    addToast('success', 'Pattern loaded', pattern.name)
  }

  return (
    <div className="p-6 h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2">💬 Pattern Generator</h1>
        <p className="text-sm text-neutral-500">
          Describe your pattern idea and I'll generate it for you
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}
          >
            <div
              className={`inline-block max-w-sm p-3 rounded-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-bg'
                  : 'bg-surface text-ink border-rule border-ink'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>

            {msg.pattern && (
              <div className="bg-ink p-3 rounded-sm max-w-sm border-rule border-ink">
                <div className="mb-2">
                  <div className="text-xs text-neutral-400 font-semibold">
                    {msg.pattern.style} · {msg.pattern.bpm} BPM
                  </div>
                  <div className="font-bold text-sm">{msg.pattern.name}</div>
                </div>

                <MiniGrid
                  pattern={generate(msg.pattern.style as any, 'Four on the Floor', false, msg.pattern.seed)}
                  cellSize={6}
                />

                <Button
                  variant="primary"
                  className="w-full text-xs mt-2"
                  onClick={() => handleUsePattern(msg.pattern)}
                >
                  📂 Use Pattern
                </Button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="space-y-2 text-left">
            <div className="inline-block max-w-sm p-3 rounded-sm bg-surface text-ink border-rule border-ink">
              <p className="text-sm">Generating pattern...</p>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length < 3 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500 font-semibold">Try something:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUICK_PROMPTS.slice(0, 2).map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs p-2 bg-bg border-rule border-ink text-left hover:bg-surface transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 border-t-rule border-t-rule pt-4">
        <input
          type="text"
          placeholder="Describe a pattern idea..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage(input)
            }
          }}
          className="input flex-1"
          disabled={loading}
        />
        <Button
          variant="primary"
          onClick={() => handleSendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  )
}
