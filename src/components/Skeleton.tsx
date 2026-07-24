interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        ...style,
      }}
    />
  )
}

export function ClassCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <Skeleton style={{ width: '140px', height: '20px' }} />
        <Skeleton style={{ width: '60px', height: '20px' }} />
      </div>
      <Skeleton style={{ width: '100px', height: '16px' }} />
      <div className="flex gap-2">
        <Skeleton style={{ width: '80px', height: '32px' }} />
        <Skeleton style={{ width: '80px', height: '32px' }} />
      </div>
    </div>
  )
}

export function StudentRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-4"
      style={{ borderBottom: '1px solid var(--color-divider)' }}
    >
      <Skeleton style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton style={{ width: '160px', height: '16px' }} />
        <Skeleton style={{ width: '100px', height: '12px' }} />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Skeleton style={{ width: '40px', height: '40px', borderRadius: '12px', marginBottom: '12px' }} />
      <Skeleton style={{ width: '60px', height: '28px', marginBottom: '6px' }} />
      <Skeleton style={{ width: '100px', height: '14px' }} />
    </div>
  )
}

export function DetailCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Skeleton style={{ width: '120px', height: '18px' }} />
      <Skeleton style={{ width: '100%', height: '14px' }} />
      <Skeleton style={{ width: '80%', height: '14px' }} />
    </div>
  )
}