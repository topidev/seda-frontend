interface ComingSoonProps {
  title: string
}

export default function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1
        style={{
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-geist)',
          fontSize: '1.5rem',
          fontWeight: 600,
        }}
      >
        {title}
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Próximamente...
      </p>
    </div>
  )
}