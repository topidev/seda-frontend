'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api/axios'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAccessToken = useAuthStore((state) => state.setAccessToken)
  // const setRefreshToken = useAuthStore((state) => state.setRefreshToken)
  const setTeacher = useAuthStore((state) => state.setTeacher)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')

    if (!token) {
      router.replace('/login')
      return
    }

    logout() //Limpiar el estado anterior
    setAccessToken(token)
    // if (refresh) setRefreshToken(refresh)

    api.post('/auth/set-cookie',
      { refreshToken: refresh },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      return api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
    }).then(({ data }) => {
      setTeacher(data)
      router.replace('/dashboard')
    }).catch(() => {
      router.replace('/login')
    })
  }, [searchParams, router, setAccessToken, setTeacher, logout])

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