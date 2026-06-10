//dashboard/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import ProtectedPage from '@/components/ProtectedPage'
import Spinner from '@/components/Spinner'
import api from '@/lib/api/axios'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { Users, BookOpen, Monitor, ClipboardList } from 'lucide-react'

interface DashboardSummary {
  totalStudents: number
  totalGroups: number
  totalClasses: number
  pendingGrades: number
  recentClasses: {
    id: string
    subject: { name: string }
    group: { grade: string; letter: string; school: { name: string } }
    academicTerm: { name: string }
  }[]
}

export default function DashboardPage() {
  const teacher = useAuthStore(state => state.teacher)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/classroom/dashboard/summary')
      return data
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const stats = [
    {
      label: 'Alumnos activos',
      value: summary?.totalStudents ?? 0,
      icon: Users,
      href: '/dashboard/students',
      color: 'var(--color-primary)',
      bg: 'rgba(37, 99, 235, 0.1)',
    },
    {
      label: 'Grupos',
      value: summary?.totalGroups ?? 0,
      icon: Users,
      href: '/dashboard/groups',
      color: 'var(--color-success)',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Clases activas',
      value: summary?.totalClasses ?? 0,
      icon: Monitor,
      href: '/dashboard/classroom',
      color: 'var(--color-info)',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
    {
      label: 'Sin calificar',
      value: summary?.pendingGrades ?? 0,
      icon: ClipboardList,
      href: '/dashboard/classroom',
      color: summary?.pendingGrades
        ? 'var(--color-warning)'
        : 'var(--color-success)',
      bg: summary?.pendingGrades
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(16, 185, 129, 0.1)',
    },
  ]

  return (
    <ProtectedPage>
      {/* Saludo */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-geist)',
          }}
        >
          {getGreeting()}{teacher?.name ? `, ${teacher.name}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map(stat => (
              <Link key={stat.label} href={stat.href}>
                <div
                  className="rounded-2xl p-5 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = stat.color
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <p
                    className="text-2xl font-semibold"
                    style={{
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-geist)',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Acceso rápido a clases */}
          {summary && summary.recentClasses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Mis clases
                </h2>
                <Link
                  href="/dashboard/classroom"
                  className="text-sm"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Ver todas
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {summary.recentClasses.map(cls => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classroom/${cls.id}`}
                  >
                    <div
                      className="rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                          <BookOpen
                            size={16}
                            style={{ color: 'var(--color-primary)' }}
                          />
                        </div>
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {cls.subject.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {cls.group.grade}°{cls.group.letter} · {cls.group.school.name}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/classroom/${cls.id}/attendance`}
                        onClick={e => e.stopPropagation()}
                      >
                        <div
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)'
                            e.currentTarget.style.color = 'var(--color-primary)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--color-border)'
                            e.currentTarget.style.color = 'var(--color-text-secondary)'
                          }}
                        >
                          Pasar lista
                        </div>
                      </Link>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {summary && summary.recentClasses.length === 0 && (
            <div
              className="rounded-2xl p-10 flex flex-col items-center gap-4"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Monitor
                size={40}
                style={{ color: 'var(--color-text-disabled)' }}
              />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Aún no tienes clases configuradas
              </p>
              <Link href="/dashboard/groups">
                <div
                  className="px-4 py-2 rounded-xl text-sm cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                  }}
                >
                  Configurar grupos
                </div>
              </Link>
            </div>
          )}
        </>
      )}
    </ProtectedPage>
  )
}