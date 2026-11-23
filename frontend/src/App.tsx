import { useStore } from '@/state/store'
import { useMIDIDevices } from '@/hooks/useMIDIDevices'
import { Header } from '@/components/app/Header'
import { ToastHost } from '@/components/ui/Toast'
import { DevicePanel } from '@/components/app/DevicePanel'
import { LoadedPattern } from '@/components/app/LoadedPattern'
import { SendButton } from '@/components/app/SendButton'
import { DevicesScreen } from '@/components/app/DevicesScreen'
import { GenerateView } from '@/views/GenerateView'
import { LibraryView } from '@/views/LibraryView'
import { ChatView } from '@/views/ChatView'

export default function App() {
  const { tab, toasts, removeToast } = useStore()
  useMIDIDevices()

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="flex desktop:flex-row tablet:flex-col-reverse min-h-[calc(100vh-56px)]">
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {tab === 'Generate' && <GenerateView />}
          {tab === 'Library' && <LibraryView />}
          {tab === 'Chat' && <ChatView />}
          {tab === 'Devices' && <DevicesScreen />}
        </div>

        {/* Device rail - persistent on desktop, top on tablet */}
        <aside className="desktop:w-80 desktop:border-l-rule desktop:border-l-rule tablet:w-full tablet:border-b-rule tablet:border-b-rule bg-surface p-6 overflow-y-auto">
          <div className="space-y-6 flex flex-col">
            <DevicePanel />
            <LoadedPattern />
            <SendButton />
          </div>
        </aside>
      </main>

      {/* Toast notifications */}
      <ToastHost toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
