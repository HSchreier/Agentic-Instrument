import { ReactNode, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface DialogProps {
  open: boolean
  title: string
  children: ReactNode
  actions: Array<{
    label: string
    variant?: 'primary' | 'secondary'
    onClick: () => void
  }>
  onClose: () => void
}

export function Dialog({ open, title, children, actions, onClose }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      dialogRef.current?.focus()
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dialog animate-dialog-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b-rule border-b-rule">
          <h2 className="dialog-title text-lg font-bold">{title}</h2>
        </div>

        <div className="p-6 dialog-body">{children}</div>

        <div className="p-6 border-t-rule border-t-rule flex justify-end gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || 'secondary'}
              onClick={() => {
                action.onClick()
                onClose()
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
