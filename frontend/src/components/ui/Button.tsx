import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  variant = 'primary',
  block = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
}: ButtonProps) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }
  const blockClasses = block ? 'btn-block' : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${blockClasses} ${className} transition-transform active:scale-95`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

interface IconButtonProps {
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
  ariaLabel?: string
  title?: string
}

export function IconButton({ disabled = false, children, onClick, className = '', ariaLabel, title }: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-ghost btn-icon ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  )
}
