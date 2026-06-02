interface AppInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  min?: number
  max?: number
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function AppInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  onKeyDown,
}: AppInputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          colorScheme: 'dark',
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />
    </div>
  )
}