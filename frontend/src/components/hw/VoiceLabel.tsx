import { useStore } from '@/state/store'
import { ADAPTERS } from '@/lib/adapters'
import type { Adapter } from '@/lib/adapters'
import { Led } from './Led'

interface VoiceLabelProps {
  adapter?: Adapter
  voiceIndex: number
  onClick?: () => void
}

export function VoiceLabel({ adapter, voiceIndex, onClick }: VoiceLabelProps) {
  const store = useStore()
  const selectedAdapter = adapter || ADAPTERS.find((a) => a.id === store.deviceId)!
  const voice = selectedAdapter.voices[voiceIndex]
  const isMuted = store.deviceMuted[`${selectedAdapter.id}:${voiceIndex}`]

  if (!voice) return null

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded transition-opacity ${
        isMuted ? 'opacity-40' : 'opacity-100'
      } hover:bg-neutral-700`}
    >
      <Led on={!isMuted} tone="accent" size={8} />
      <div className="text-xs font-semibold">{voice.name}</div>
    </button>
  )
}
