'use client'

import { useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import Spinner from '@/components/Spinner'
import { useWeeklySchedule } from '@/hooks/useSchedule'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function ActivitiesPage() {
  usePageTitle('Actividades')
  const [weekOffset, setWeekOffset] = useState(0)
  const { data: weekly, isLoading } = useWeeklySchedule(weekOffset)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })

  const formatWeekRange = () => {
    if (!weekly) return ''
    const start = new Date(weekly.weekStart).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })
    const end = new Date(weekly.weekEnd).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    return `${start} - ${end}`
  }

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const totalActivities = weekly?.days.reduce(
    (sum, day) => sum + day.schedules.reduce(
      (s, sch) => s + sch.activities.length, 0
    ), 0
  ) ?? 0

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Actividades
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {totalActivities > 0
              ? `${totalActivities} actividad${totalActivities > 1 ? 'es' : ''} esta semana`
              : 'Sin actividades esta semana'}
          </p>
        </div>
      </div>

      {/* Navegación de semanas */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl mb-6"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => setWeekOffset(prev => prev - 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {formatWeekRange()}
          </p>
          {weekOffset === 0 && (
            <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
              Semana actual
            </p>
          )}
        </div>

        <button
          onClick={() => setWeekOffset(prev => prev + 1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--color-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-secondary)'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading && <Spinner />}

      {/* Días de la semana */}
      {!isLoading && weekly && (
        <div className="flex flex-col gap-4">
          {weekly.days.map(day => {
            const today = isToday(day.date)
            const hasSchedules = day.schedules.length > 0

            return (
              <div key={day.dayOfWeek}>
                {/* Header del día */}
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: today
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-tertiary)',
                      color: today ? 'white' : 'var(--color-text-disabled)',
                    }}
                  >
                    {new Date(day.date).getDate()}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: today
                          ? 'var(--color-primary)'
                          : 'var(--color-text-primary)',
                      }}
                    >
                      {DAY_NAMES[day.dayOfWeek]}
                      {today && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          Hoy
                        </span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
                      {formatDate(day.date)}
                    </p>
                  </div>
                </div>

                {/* Clases del día */}
                {!hasSchedules ? (
                  <div
                    className="ml-11 px-4 py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-disabled)',
                    }}
                  >
                    Sin clases
                  </div>
                ) : (
                  <div className="ml-11 flex flex-col gap-2">
                    {day.schedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className="rounded-2xl overflow-hidden"
                        style={{
                          backgroundColor: 'var(--color-bg-elevated)',
                          border: `1px solid ${today ? 'var(--color-primary)20' : 'var(--color-border)'}`,
                        }}
                      >
                        {/* Header de la clase */}
                        <Link
                          href={`/dashboard/classroom/${schedule.subjectTermGroupId}`}
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
                            style={{
                              borderBottom: schedule.activities.length > 0
                                ? '1px solid var(--color-divider)'
                                : 'none',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                              >
                                <BookOpen
                                  size={14}
                                  style={{ color: 'var(--color-primary)' }}
                                />
                              </div>
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
                            {schedule.activities.length > 0 && (
                              <span
                                className="text-xs px-2 py-1 rounded-lg font-medium"
                                style={{
                                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                  color: 'var(--color-warning)',
                                }}
                              >
                                {schedule.activities.length} actividad{schedule.activities.length > 1 ? 'es' : ''}
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Actividades de la clase */}
                        {schedule.activities.map((activity, idx) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between px-4 py-2.5"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderBottom: idx < schedule.activities.length - 1
                                ? '1px solid var(--color-divider)'
                                : 'none',
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: 'var(--color-warning)' }}
                              />
                              <span
                                className="text-sm"
                                style={{ color: 'var(--color-text-primary)' }}
                              >
                                {activity.title}
                              </span>
                            </div>
                            {activity.dueDate && (
                              <span
                                className="text-xs"
                                style={{ color: 'var(--color-text-disabled)' }}
                              >
                                {formatDate(activity.dueDate)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Estado vacío global */}
      {!isLoading && weekly && totalActivities === 0 &&
        weekly.days.every(d => d.schedules.length === 0) && (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-3 mt-4"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No hay horarios configurados
            </p>
            <p
              className="text-sm text-center"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              Configura el horario de tus clases desde Mis Clases
            </p>
          </div>
        )}
    </ProtectedPage>
  )
}