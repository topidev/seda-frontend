//dashboard/page.tsx
//Temporal
'use client'

import { useRequiredAuth } from '@/hooks/useAuthGuard'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardPage() {
  const teacher = useAuthStore((state) => state.teacher)
  const { isAuthenticated } = useRequiredAuth()
  const accessToken = useAuthStore((state) => state.accessToken)

  if (!isAuthenticated) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </main>
    )
  }

  return (
    <main
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <h1 style={{ color: 'var(--color-text-primary)' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Token: {accessToken ? '✓ presente' : '✗ ausente'}
      </p>
    </main>
  )
}