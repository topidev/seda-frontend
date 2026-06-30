interface AppButtonProps {
  onClick?: () => void
  disabled?: boolean
  isPending?: boolean
  type?: "button" | "submit" | "reset" | undefined
  pendingLabel?: string
  children: React.ReactNode
  variant?: 'primary' | 'danger' | 'ghost'
  fullWidth?: boolean
}

export default function AppButton({
  onClick,
  disabled,
  isPending,
  type,
  pendingLabel = 'Guardando...',
  children,
  variant = 'primary',
  fullWidth = false,
}: AppButtonProps) {
  const isDisabled = disabled || isPending
  const whatType = type || "submit"

  const bgColor = () => {
    if (isDisabled) return 'var(--color-text-disabled)'
    if (variant === 'primary') return 'var(--color-primary)'
    if (variant === 'danger') return 'var(--color-bg-tertiary)'
    return 'var(--color-bg-tertiary)'
  }

  const hoverBgColor = () => {
    if (variant === 'primary') return 'var(--color-primary-hover)'
    if (variant === 'danger') return 'var(--color-error)'
    return 'var(--color-bg-secondary)'
  }

  const textColor = () => {
    if (variant === 'danger') return 'var(--color-error)'
    return 'white'
  }

  const hoverTextColor = () => {
    if (variant === 'danger') return 'white'
    return 'white'
  }

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      type={whatType}
      className={`${fullWidth ? 'w-full' : ''} py-3 px-4 rounded-xl font-medium transition-colors`}
      style={{
        backgroundColor: bgColor(),
        color: textColor(),
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        border: variant !== 'primary' ? '1px solid var(--color-border)' : 'none',
      }}
      onMouseEnter={e => {
        if (isDisabled) return
        e.currentTarget.style.backgroundColor = hoverBgColor()
        e.currentTarget.style.color = hoverTextColor()
      }}
      onMouseLeave={e => {
        if (isDisabled) return
        e.currentTarget.style.backgroundColor = bgColor()
        e.currentTarget.style.color = textColor()
      }}
    >
      {isPending ? pendingLabel : children}
    </button>
  )
}