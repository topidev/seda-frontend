//dashboard/page.tsx
//Temporal
'use client'

import ProtectedPage from '@/components/ProtectedPage'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardPage() {
  const teacher = useAuthStore((state) => state.teacher)
  const accessToken = useAuthStore((state) => state.accessToken)
  
  return (
    <ProtectedPage>

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
    </ProtectedPage>
  )
}