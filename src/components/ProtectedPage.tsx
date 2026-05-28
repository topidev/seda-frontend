'use client'

import { useRequiredAuth } from '@/hooks/useAuthGuard'

interface ProtectedPageProps {
  children: React.ReactNode
}

export default function ProtectedPage({ children }: ProtectedPageProps) {
  const { isAuthenticated, isReady } = useRequiredAuth()

  if (!isReady) {
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

  if (!isAuthenticated) return null

  return <>{children}</>
}