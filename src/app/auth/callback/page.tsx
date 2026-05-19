//auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      router.replace('/login')
      return
    }

    // Guarda el token en Zustand (memoria)
    setAccessToken(token)

    // Redirige al dashboard
    router.replace('/dashboard')
  }, [])

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