import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { type Pattern } from '@/lib/api'

interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  pattern?: Pattern
  suggestedActions?: Array<{ label: string; action: string }>
  timestamp: Date
}

interface ChatInterfaceProps {
  onPattern?: (pattern: Pattern) => void
  onSave?: (pattern: Pattern) => void
  onSend?: (pattern: Pattern) => void
}

export function ChatInterface({ onPattern, onSave, onSend }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🎵 Hi! I\'m your Rhythm Wolf AI assistant. Describe the drum pattern you want, and I\'ll generate it for you!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await axios.post('/api/chat/message', {
        message,
        conversationId: 'default',
      })
      return response.data
    },
    onSuccess: (data) => {
      const assistantMsg: ChatMsg = {
        id: data.id,
        role: 'assistant',
        content: data.content,
        pattern: data.pattern,
        suggestedActions: data.suggestedActions,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])

      // Auto-trigger pattern callback if pattern was generated
      if (data.pattern && onPattern) {
        onPattern(data.pattern)
      }
    },
  })

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMsg: ChatMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Send to backend
    mutation.mutate(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">🎙️ Chat with Claude</h2>
        <p className="text-sm text-blue-100">Describe patterns in natural language</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-sm rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
              }`}
            >
              {/* Text content */}
              <p className="text-sm">{msg.content}</p>

              {/* Pattern preview if generated */}
              {msg.pattern && (
                <div className="mt-3 p-3 bg-gray-100 rounded border border-gray-300">
                  <div className="text-xs font-semibold text-gray-700 mb-2">📊 Pattern Generated</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Style:</span> {msg.pattern.metadata.style}
                    </div>
                    <div>
                      <span className="font-medium">Tempo:</span> {msg.pattern.metadata.tempo} BPM
                    </div>
                    <div>
                      <span className="font-medium">Events:</span> {msg.pattern.metadata.num_events}
                    </div>
                  </div>

                  {/* Suggested actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.action === 'save' && onSave) onSave(msg.pattern!)
                            if (action.action === 'send' && onSend) onSend(msg.pattern!)
                          }}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs opacity-70 mt-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Loading state */}
        {mutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 rounded-lg rounded-bl-none p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        {mutation.isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-2 text-sm">
            Error: {mutation.error instanceof Error ? mutation.error.message : 'Unknown error'}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the pattern you want... (e.g., 'Create a hypnotic techno groove at 130 BPM')"
            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-20"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={mutation.isPending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition h-fit"
          >
            {mutation.isPending ? '⏳' : '✨ Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Shift+Enter for new line, Enter to send</p>
      </div>
    </div>
  )
}
