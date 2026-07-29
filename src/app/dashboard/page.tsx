//dashboard/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import ProtectedPage from '@/components/ProtectedPage'
import Spinner from '@/components/Spinner'
import api from '@/lib/api/axios'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { Users, Monitor, ClipboardList, ChevronRight, Plus, Flag, School, User, CalendarDays, Trash2 } from 'lucide-react'
import InstallBanner from '@/components/InstallBanner'
import { ClassCardSkeleton, StatCardSkeleton } from '@/components/Skeleton'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTodaySchedule } from '@/hooks/useSchedule'
import { DaySchedule } from '@/types'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateEvent, useDeleteEvent, useUpcomingEvents } from '@/hooks/useEvents'
import { useSchools } from '@/hooks/useSchools'
import { useState } from 'react'
import AppButton from '@/components/AppButton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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
  usePageTitle('Inicio')
  const teacher = useAuthStore(state => state.teacher)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data } = await api.get<DashboardSummary>('/classroom/dashboard/summary')
      return data
    },
  })
  const { data: upcomingEvents } = useUpcomingEvents(60)
  const { data: todaySchedule, isLoading: isLoadingToday } = useTodaySchedule()

  const totalTodayActivities = todaySchedule?.reduce(
    (sum: number, s: DaySchedule) => sum + s.activities.length, 0
  ) ?? 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const stats = [
    {
      label: 'Alumnos',
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
      label: 'Clases',
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
      <div className="mb-6  pb-6 border-b border-gray-700">
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

      <InstallBanner />

      {isLoading && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => <ClassCardSkeleton key={i} />)}
          </div>
        </>
      )}

      {!isLoading && (
        <>
          {/* Actividades de hoy */}
          {!isLoadingToday && todaySchedule && todaySchedule.length > 0 && (
            <div
              className='mb-8'
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-lg font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Clases de hoy
                  </h2>
                </div>
                <Link
                  href="/dashboard/activities"
                  className="text-sm"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Ver semana
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {todaySchedule.map(schedule => (
                  <div
                    key={schedule.id}
                    className="rounded-xl overflow-hidden transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-elevated',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  >
                    {/* Header clase */}
                    <Link href={`/dashboard/classroom/${schedule.subjectTermGroupId}`}>
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          backgroundColor: 'var(--color-bg-elevated)',
                          borderBottom: schedule.activities.length > 0
                            ? '1px solid var(--color-divider)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p
                              className="text-sm font-medium"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {schedule.subjectName}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                              {schedule.groupName} · {schedule.startTime}
                              {schedule.endTime && ` - ${schedule.endTime}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {schedule.activities.length > 0 && (
                            <span
                              className="text-xs px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                color: 'var(--color-warning)',
                              }}
                            >
                              {schedule.activities.length} actividad{schedule.activities.length > 1 ? 'es' : ''}
                            </span>
                          )}
                          <ChevronRight size={14} style={{ color: 'var(--color-text-disabled)' }} />
                        </div>
                      </div>
                    </Link>

                    {/* Actividades */}
                    {schedule.activities.map((activity, idx) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          backgroundColor: 'var(--color-bg-elevated)',
                          borderBottom: idx < schedule.activities.length - 1
                            ? '1px solid var(--color-divider)'
                            : 'none',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: 'var(--color-warning)' }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {activity.title}
                          </span>
                        </div>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          {activity.category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Sin clases hoy pero tiene horario configurado */}
          {!isLoadingToday && todaySchedule && todaySchedule.length === 0 && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
              style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No tienes clases hoy
              </p>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 mt-6">
            {stats.map(stat => (
              <Link key={stat.label} href={stat.href}>
                <div
                  className="flex items-center flex-col rounded-2xl p-5 md:p-3 lg:p-4 xl:p-5 cursor-pointer transition-colors"
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

          {/* Próximos eventos */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Próximos eventos
              </h2>
              <Link
                href="/dashboard/events"
                className="text-sm"
                style={{ color: 'var(--color-primary)' }}
              >
                Ver todos
              </Link>
            </div>

            {!upcomingEvents || upcomingEvents.length === 0 ? (
              <div
                className="rounded-2xl p-8 flex flex-col items-center gap-3"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <CalendarDays size={32} style={{ color: 'var(--color-text-disabled)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Sin eventos próximos
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingEvents.slice(0, 3).map(event => {
                  const eventDate = new Date(event.date)
                  const typeConfig = {
                    NATIONAL_HOLIDAY: { color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)', icon: Flag },
                    SCHOOL: { color: 'var(--color-info)', bg: 'rgba(6, 182, 212, 0.1)', icon: School },
                    PERSONAL: { color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.1)', icon: User },
                    OTHER: { color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)', icon: CalendarDays },
                  }
                  const config = typeConfig[event.type]
                  const Icon = config.icon

                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                      style={{
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <span
                          className="text-lg font-semibold leading-none"
                          style={{ color: config.color, fontFamily: 'var(--font-geist)' }}
                        >
                          {eventDate.getDate()}
                        </span>
                        <span className="text-xs uppercase" style={{ color: config.color }}>
                          {eventDate.toLocaleDateString('es-MX', { month: 'short' })}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {event.title}
                        </p>
                        {event.description && (
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {event.description}
                          </p>
                        )}
                        {event.schoolName && (
                          <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                            {event.schoolName}
                          </p>
                        )}
                      </div>

                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: config.bg }}
                      >
                        <Icon size={14} style={{ color: config.color }} />
                      </div>
                    </div>
                  )
                })}

                {upcomingEvents.length > 3 && (
                  <Link href="/dashboard/events">
                    <p
                      className="text-sm text-center py-2 cursor-pointer"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Ver {upcomingEvents.length - 3} más
                    </p>
                  </Link>
                )}
              </div>
            )}
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
                  <div
                    key={cls.id}
                    className="rounded-2xl p-4 flex items-center justify-between transition-colors"
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
                    <Link
                      href={`/dashboard/classroom/${cls.id}`}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
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
                    </Link>

                    <Link href={`/dashboard/classroom/${cls.id}/attendance`}>
                      <div
                        className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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