'use client'

import { useRedirectIfAuthenticated } from '@/hooks/useAuthGuard'
import { GraduationCap } from 'lucide-react'

export default function LoginPage() {
 
  const { isAuthenticated, isReady } = useRedirectIfAuthenticated()
  
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
  }
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
  if (isAuthenticated) return null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}>

      {/* Logo y título */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <GraduationCap size={32} color="white" />
        </div>
        <h1 className="text-2xl font-semibold"
            style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)', // Geist para el título
            }}>
          SEDA
        </h1>
        <p className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}>
          Sistema Escolar de Alumnos
        </p>
      </div>

      {/* Card de login */}
      <div className="w-full max-w-sm rounded-2xl p-8"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}>

        <h2 className="text-lg text-center font-medium mb-6"
            style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-display)', // Geist para el título
            }}>
          Iniciar sesión
        </h2>

        {/* Botón de Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
          }}
        >
          {/* Logo de Google en SVG para no depender de imágenes externas */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </button>

        {/* Divider */}
        <div className="my-6" style={{ borderTop: '1px solid var(--color-divider)' }} />

        {/* Nota informativa */}
        <p className="text-xs text-center"
          style={{ color: 'var(--color-text-disabled)' }}>
          Solo maestros con cuenta autorizada pueden acceder.
          Si tienes problemas para ingresar contacta a soporte.
        </p>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs"
        style={{ color: 'var(--color-text-disabled)' }}>
        SEDA © {new Date().getFullYear()}
      </p>
    </main>
  )
}