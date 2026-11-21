import { useQuery } from '@tanstack/react-query'
import { listDevices } from '@/lib/api'

interface Props {
  onSelect: (device: string) => void
}

export function DeviceSelector({ onSelect }: Props) {
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: listDevices,
    refetchInterval: 2000, // Check for devices every 2 seconds
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🎛️ Select Device</h2>

      {isLoading ? (
        <p className="text-gray-500">Scanning devices...</p>
      ) : devices.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded text-sm">
          <p>No MIDI devices found</p>
          <p className="text-xs mt-1">Connect your Rhythm Wolf via USB</p>
        </div>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => (
            <button
              key={device}
              onClick={() => onSelect(device)}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎵</span>
                <span className="font-medium text-gray-900">{device}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
