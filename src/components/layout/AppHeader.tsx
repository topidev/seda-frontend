'use client'

import { usePathname } from 'next/navigation'
import { Bell, Sun, Moon, WifiOff } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'
import { useOnlineStatus, usePendingCount } from '@/hooks/useSync'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/dashboard/classroom': 'Mis clases',
  '/dashboard/schools': 'Escuelas',
  '/dashboard/subjects': 'Materias',
  '/dashboard/groups': 'Grupos',
  '/dashboard/students': 'Alumnos',
  '/dashboard/profile': 'Perfil',
}

export default function AppHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isOnline = useOnlineStatus()
  const pendingCount = usePendingCount()

  const getTitle = () => {
    // Busca primero match exacto
    if (pageTitles[pathname]) return pageTitles[pathname]

    // Para rutas dinámicas como /dashboard/schools/[id]
    if (pathname.startsWith('/dashboard/classroom')) return 'Mis clases'
    if (pathname.startsWith('/dashboard/schools')) return 'Escuelas'
    if (pathname.startsWith('/dashboard/students')) return 'Alumnos'
    if (pathname.startsWith('/dashboard/subjects')) return 'Materias'
    if (pathname.startsWith('/dashboard/groups')) return 'Grupos'

    return 'Dashboard'
  }

  useEffect(() => {
    const fr = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(fr)
  }, [])

  if (!mounted) return null

  return (
    <header
      className="h-14 flex items-center justify-between px-4 border-b"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Título + trigger del sidebar en mobile */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h2
          className="text-lg font-semibold"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-geist)',
          }}
        >
          {getTitle()}
        </h2>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">

        {!isOnline && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid var(--color-warning)',
              color: 'var(--color-warning)',
            }}
          >
            <WifiOff size={13} />
            <span className="hidden sm:inline">Sin conexión</span>
          </div>
        )}

        {pendingCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid var(--color-info)',
              color: 'var(--color-info)',
            }}
          >
            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
          </div>
        )}

        {/* Notificaciones */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Bell size={18} />
        </button>

        {/* Toggle tema */}
        {/* {mounted && ( */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {/* )} */}

      </div>
    </header>
  )
}