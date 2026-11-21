import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendPattern, type Pattern } from '@/lib/api'

interface Props {
  pattern: Pattern
  device: string
  isLoading: boolean
  onStatusChange: (loading: boolean) => void
}

export function PatternSender({ pattern, device, isLoading, onStatusChange }: Props) {
  const [status, setStatus] = useState<'idle' | 'ready' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      sendPattern({
        device,
        pattern,
      }),
    onMutate: () => {
      onStatusChange(true)
      setStatus('sending')
      setMessage('⏳ Sending pattern to device...')
    },
    onSuccess: (data) => {
      onStatusChange(false)
      setStatus('success')
      setMessage(`✅ Sent ${data.events_sent} events to ${device}`)
    },
    onError: (error) => {
      onStatusChange(false)
      setStatus('error')
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    },
  })

  const handleSend = () => {
    if (status === 'idle') {
      setStatus('ready')
      setMessage('⚠️  Put your Rhythm Wolf in Record Performance mode (SHIFT + Step 10)')
    } else if (status === 'ready') {
      mutation.mutate()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">📤 Send to Device</h2>

      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-sm font-medium text-blue-900">Target: {device}</p>
        <p className="text-xs text-blue-700 mt-1">Events: {pattern.metadata.num_events}</p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            status === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : status === 'error'
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Send Button */}
      {status === 'idle' && (
        <button
          onClick={handleSend}
          disabled={!device}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
        >
          🎵 Prepare to Send
        </button>
      )}

      {status === 'ready' && (
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition animate-pulse"
        >
          {isLoading ? '⏳ Sending...' : '▶️ Send Now'}
        </button>
      )}

      {status === 'success' && (
        <div>
          <button
            onClick={() => setStatus('idle')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
          >
            ✓ Done - Generate Another
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Now save on device: SHIFT + Step 16 (SAVE)
          </p>
        </div>
      )}

      {status === 'error' && (
        <button
          onClick={() => setStatus('idle')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          🔄 Try Again
        </button>
      )}
    </div>
  )
}
