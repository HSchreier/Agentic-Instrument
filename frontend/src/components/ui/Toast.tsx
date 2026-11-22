import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Led } from '@/components/hw/Led'
import { IconButton } from '@/components/ui/Button'
import type { Toast as ToastType } from '@/state/store'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const duration = toast.kind === 'error' ? 5000 : toast.kind === 'info' ? 2200 : 3000
    const timer = setTimeout(() => onRemove(toast.id), duration)
    return () => clearTimeout(timer)
  }, [toast.id, toast.kind, onRemove])

  const bgColor = {
    success: 'bg-bg',
    error: 'bg-accent-700',
    info: 'bg-bg',
  }[toast.kind]

  const textColor = {
    success: 'text-ink',
    error: 'text-white',
    info: 'text-ink',
  }[toast.kind]

  return (
    <div
      className={`${bgColor} ${textColor} border-rule border-ink shadow-lg p-4 max-w-sm w-80 animate-fade-in`}
    >
      <div className="flex items-start gap-3">
        <Led on={true} size={10} tone={toast.kind === 'error' ? 'white' : 'accent'} />
        <div className="flex-1">
          <div className="font-bold text-sm">{toast.title}</div>
          <div className="text-sm mt-1">{toast.body}</div>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`text-sm underline mt-2 ${textColor}`}
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <IconButton onClick={() => onRemove(toast.id)} ariaLabel="Close">
          <X size={16} />
        </IconButton>
      </div>
    </div>
  )
}

interface ToastHostProps {
  toasts: ToastType[]
  onRemoveToast: (id: string) => void
}

export function ToastHost({ toasts, onRemoveToast }: ToastHostProps) {
  return (
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  )
}
