import { useStore } from '@/state/store'
import { ADAPTERS } from '@/lib/adapters'
import type { Adapter } from '@/lib/adapters'

interface PageButtonsProps {
  adapter?: Adapter
}

export function PageButtons({ adapter }: PageButtonsProps) {
  const store = useStore()
  const selectedAdapter = adapter || ADAPTERS.find((a) => a.id === store.deviceId)!

  if (selectedAdapter.pages <= 1) return null

  return (
    <div className="flex gap-2 items-center border-t border-neutral-700 pt-3">
      <span className="text-xs text-neutral-400 font-semibold">Page</span>
      <div className="flex gap-1">
        {Array.from({ length: selectedAdapter.pages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => store.setPage(idx)}
            className={`px-3 py-1 text-xs font-bold rounded transition-all ${
              store.page === idx
                ? 'bg-accent text-black'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
      <span className="text-xs text-neutral-400 ml-auto">
        Steps {store.page * 16 + 1}–{Math.min((store.page + 1) * 16, selectedAdapter.steps)}
      </span>
    </div>
  )
}
