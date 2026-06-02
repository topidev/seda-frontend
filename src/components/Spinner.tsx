interface SpinnerProps {
  fullScreen?: boolean
}

export default function Spinner({ fullScreen = false }: SpinnerProps) {
  const spinner = (
    <div
      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: 'var(--color-primary)' }}
    />
  )

  if (fullScreen) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex justify-center py-12">
      {spinner}
    </div>
  )
}