'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken)

  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')

    if (!token) {
      router.replace('/login')
      return
    }

    setAccessToken(token)
    if (refresh) setRefreshToken(refresh)
    router.replace('/dashboard')
  }, [searchParams, router, setAccessToken, setRefreshToken])

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)' }}
        />
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Iniciando sesión...
        </p>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)' }}
          />
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}