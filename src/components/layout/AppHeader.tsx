'use client'

import { usePathname } from 'next/navigation'
import { Bell, Sun, Moon, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useEffect, useRef, useState } from 'react'
import { useUpcomingEvents } from '@/hooks/useEvents'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/dashboard/classroom': 'Mis clases',
  '/dashboard/schools': 'Escuelas',
  '/dashboard/subjects': 'Materias',
  '/dashboard/groups': 'Grupos',
  '/dashboard/students': 'Alumnos',
  '/dashboard/profile': 'Perfil',
  '/dashboard/activities': 'Actividades',
  '/dashboard/events': 'Eventos',
}

export default function AppHeader() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const { data: upcomingEvents } = useUpcomingEvents(7)
  const notifCount = upcomingEvents?.length ?? 0

  useEffect(() => {
    const fr = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(fr)
  }, [])

  useEffect(() => {
    if (!openNotifications) return
    const openNotifyHandler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotifications(false)
      }
    }

    document.addEventListener('mousedown', openNotifyHandler)
    return () => document.removeEventListener('mousedown', openNotifyHandler)

  }, [openNotifications])

  const getTitle = () => {
    // Busca primero match exacto
    if (pageTitles[pathname]) return pageTitles[pathname]

    // Para rutas dinámicas como /dashboard/schools/[id]
    if (pathname.startsWith('/dashboard/schools')) return 'Escuelas'
    if (pathname.startsWith('/dashboard/students')) return 'Alumnos'
    if (pathname.startsWith('/dashboard/subjects')) return 'Materias'
    if (pathname.startsWith('/dashboard/groups')) return 'Grupos'
    if (pathname.startsWith('/dashboard/classroom')) return 'Mis clases'
    if (pathname.startsWith('/dashboard/activities')) return 'Actividades'
    if (pathname.startsWith('/dashboard/events')) return 'Eventos'

    return 'Dashboard'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const typeColors: Record<string, string> = {
    NATIONAL_HOLIDAY: 'var(--color-error)',
    SCHOOL: 'var(--color-info)',
    PERSONAL: 'var(--color-primary)',
    OTHER: 'var(--color-warning',
  }



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

        {/* Notificaciones */}
        <div className="relative" ref={notifRef}>
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
            onClick={() => setOpenNotifications(!openNotifications)}
          >
            <Bell size={18} />
            {mounted && notifCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: 'var(--color-error)',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
          {/* Dropdown */}
          {openNotifications && (
            <div
              className="absolute right-0 top-11 rounded-2xl shadow-lg z-50 overflow-hidden"
              style={{
                width: '320px',
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Header dropdown */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--color-divider)' }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Eventos próximos
                </p>
                <button
                  onClick={() => setOpenNotifications(false)}
                  style={{ color: 'var(--color-text-disabled)' }}
                  className="cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Lista de eventos */}
              {notifCount === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                    Sin eventos en los próximos 7 días
                  </p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {upcomingEvents?.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{
                        borderBottom: index < notifCount - 1
                          ? '1px solid var(--color-divider)'
                          : 'none',
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: typeColors[event.type] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {event.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {formatDate(event.date)}
                          {event.schoolName && ` · ${event.schoolName}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid var(--color-divider)' }}
              >
                <a
                  href="/dashboard/events"
                  className="text-sm w-full text-center block cursor-pointer"
                  style={{ color: 'var(--color-primary)' }}
                  onClick={() => setOpenNotifications(false)}
                >
                  Ver todos los eventos
                </a>
              </div>
            </div>
          )}
        </div>

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
    </header >
  )
}