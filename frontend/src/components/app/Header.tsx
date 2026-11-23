import { Settings } from 'lucide-react'
import { useStore } from '@/state/store'
import { Tag } from '@/components/ui/Tag'
import { IconButton } from '@/components/ui/Button'

export function Header() {
  const { tab, setTab, deviceState } = useStore()

  const statusColor = {
    connected: 'accent',
    disconnected: 'neutral',
    error: 'outline',
    scanning: 'neutral',
  } as const

  const statusLabel = {
    connected: 'Connected',
    disconnected: 'No device',
    error: 'Device error',
    scanning: 'Scanning...',
  } as const

  return (
    <header className="border-rule border-b-rule bg-bg">
      <div className="flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center border-rule border-r-rule pr-4 pl-4">
          <div className="grid grid-cols-4 gap-0.5 mr-3">
            <div className="w-1.5 h-1.5 bg-accent" />
            <div className="w-1.5 h-1.5 bg-ink" />
            <div className="w-1.5 h-1.5 bg-accent" />
            <div className="w-1.5 h-1.5 bg-ink" />
            <div className="w-1.5 h-1.5 bg-ink" />
            <div className="w-1.5 h-1.5 bg-ink" />
            <div className="w-1.5 h-1.5 bg-ink" />
            <div className="w-1.5 h-1.5 bg-accent" />
          </div>
          <div>
            <div className="text-sm font-black leading-tight">RHYTHM WOLF</div>
            <div className="text-xs font-semibold tracking-wider uppercase">MIDI CONTROL</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-1 px-6" role="tablist">
          {(['Generate', 'Library', 'Devices', 'Chat'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-5 py-4 font-semibold text-sm uppercase tracking-wider transition ${
                tab === t
                  ? 'text-ink border-b-4 border-accent -mb-0.5'
                  : 'text-neutral-500 hover:text-ink'
              }`}
            >
              {t === 'Generate' && '✨ '}
              {t === 'Library' && '📚 '}
              {t === 'Devices' && '🖥️ '}
              {t === 'Chat' && '💬 '}
              {t}
            </button>
          ))}
        </div>

        {/* Status & Settings */}
        <div className="flex items-center gap-3 pr-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deviceState === 'connected' ? '#ec3013' : '#d7d3d3' }} />
            <Tag tone={statusColor[deviceState]}>{statusLabel[deviceState]}</Tag>
          </div>
          <IconButton ariaLabel="Settings">
            <Settings size={20} className="text-ink" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
