//auth/callback/page.tsx
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'


function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)

  useEffect(() => {
    const token = searchParams.get('token')
    console.log('token recibido:', token)
    console.log('url completa:', window.location.href)

    if (!token) {
      console.log('no hay token, redirigiendo a login')
      router.replace('/login')
      return
    }

    setAccessToken(token)
    console.log('token guardado, redirigiendo a dashboard')
    router.replace('/dashboard')
  }, [searchParams, router, setAccessToken])

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
  <Suspense>
    <AuthCallbackContent />
  </Suspense>
}