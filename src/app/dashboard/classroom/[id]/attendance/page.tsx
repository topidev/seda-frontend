/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import BackButton from '@/components/BackButton'
import AppButton from '@/components/AppButton'
import Spinner from '@/components/Spinner'
import {
  useClassDetail,
  useAttendanceByDate,
  useSaveAttendance,
} from '@/hooks/useClassroom'
import { useOnlineStatus } from '@/hooks/useSync'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { WifiOff } from 'lucide-react'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'

const statusConfig: Record<
  AttendanceStatus,
  { label: string; color: string; bg: string }
> = {
  PRESENT: {
    label: 'Presente',
    color: 'var(--color-success)',
    bg: 'rgba(16, 185, 129, 0.1)',
  },
  ABSENT: {
    label: 'Ausente',
    color: 'var(--color-error)',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
  LATE: {
    label: 'Tardanza',
    color: 'var(--color-warning)',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  EXCUSED: {
    label: 'Justificado',
    color: 'var(--color-info)',
    bg: 'rgba(6, 182, 212, 0.1)',
  },
}

const statusCycle: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']

export default function AttendancePage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string

  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({})
  const [offlineClass, setOfflineClass] = useState<any>(null)

  const isOnline = useOnlineStatus()

  const { data: onlineClass, isLoading: isLoadingClass } = useClassDetail(subjectTermGroupId)
  const { data: existingAttendance, isLoading: isLoadingAttendance } = useAttendanceByDate(
    subjectTermGroupId,
    selectedDate,
  )
  const { mutate: saveAttendance, isPending } = useSaveAttendance(subjectTermGroupId)


  useEffect(() => { //Con Internet
    if (onlineClass) {
      db.cachedClasses.put({
        id: subjectTermGroupId,
        data: onlineClass,
        cachedAt: new Date().toISOString()
      })
    }

  }, [onlineClass, subjectTermGroupId])

  useEffect(() => {
    if (!isOnline && !onlineClass) {
      db.cachedClasses.get(subjectTermGroupId).then(cached => {
        if (cached) setOfflineClass(cached.data)
      })
    }
  }, [isOnline, onlineClass, subjectTermGroupId])

  const cls = onlineClass ?? offlineClass
  const students = cls?.group.studentGroupTerms ?? []

  useEffect(() => {
    if (!students.length) return

    const initial: Record<string, AttendanceStatus> = {}
    students.forEach((sgt: any) => {
      const existing = existingAttendance?.find(
        (a: any) => a.studentId === sgt.studentId,
      )
      initial[sgt.studentId] = existing?.status ?? 'PRESENT'
    })
    setAttendance(initial)
  }, [students.length, existingAttendance, selectedDate])

  const handleToggle = (studentId: string) => {
    setAttendance(prev => {
      const current = prev[studentId] ?? 'PRESENT'
      const currentIndex = statusCycle.indexOf(current)
      const next = statusCycle[(currentIndex + 1) % statusCycle.length]
      return { ...prev, [studentId]: next }
    })
  }

  const handleSave = async () => {
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }))

    if (isOnline) {
      saveAttendance({ date: selectedDate, records })
    } else {
      await db.pendingAttendance.add({
        subjectTermGroupId,
        date: selectedDate,
        records,
        createdAt: new Date().toISOString(),
        attempts: 0
      })
      toast.success('Lista guardada. Se sincronizará cuando recuperes internet.')
    }

    // saveAttendance({ date: selectedDate, records })
  }

  // Contadores
  const counts = Object.values(attendance).reduce(
    (acc, status) => {
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    },
    {} as Record<AttendanceStatus, number>,
  )

  if (isLoadingClass) {
    return (
      <ProtectedPage>
        <Spinner />
      </ProtectedPage>
    )
  }

  if (!cls) {
    return (
      <ProtectedPage>
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <WifiOff size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Sin conexión y sin datos cacheados
          </p>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-disabled)' }}>
            Abre la app con internet al menos una vez para poder pasar lista offline
          </p>
        </div>
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton href={`/dashboard/classroom/${subjectTermGroupId}`} />
        <div className="flex-1">
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Pasar lista
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.subject.name} · {cls?.group.grade}°{cls?.group.letter}
          </p>
        </div>
      </div>

      {/* Selector de fecha */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Fecha
        </span>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="flex-1 outline-none bg-transparent text-sm"
          style={{
            color: 'var(--color-text-primary)',
            colorScheme: 'dark',
          }}
        />
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(Object.entries(statusConfig) as [AttendanceStatus, typeof statusConfig[AttendanceStatus]][]).map(
          ([status, config]) => (
            <div
              key={status}
              className="rounded-xl p-3 flex flex-col items-center gap-1"
              style={{
                backgroundColor: config.bg,
                border: `1px solid ${config.color}20`,
              }}
            >
              <span
                className="text-xl font-semibold"
                style={{
                  color: config.color,
                  fontFamily: 'var(--font-geist)',
                }}
              >
                {counts[status] ?? 0}
              </span>
              <span
                className="text-xs"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
            </div>
          ),
        )}
      </div>

      {/* Lista de alumnos */}
      {isLoadingAttendance && isOnline ? (
        <Spinner />
      ) : (
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {students.map((sgt: any, index: any) => {
            const status = attendance[sgt.studentId] ?? 'PRESENT'
            const config = statusConfig[status]
            const isLast = index === students.length - 1

            return (
              <button
                key={sgt.studentId}
                onClick={() => handleToggle(sgt.studentId)}
                className="w-full flex items-center justify-between px-4 py-4 transition-colors cursor-pointer"
                style={{
                  backgroundColor: index % 2 === 0
                    ? 'var(--color-bg-elevated)'
                    : 'var(--color-bg-secondary)',
                  borderBottom: isLast
                    ? 'none'
                    : '1px solid var(--color-divider)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                    style={{
                      backgroundColor: config.bg,
                      color: config.color,
                    }}
                  >
                    {sgt.student.name[0]}{sgt.student.firstLastName[0]}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {sgt.student.name} {sgt.student.firstLastName}{' '}
                    {sgt.student.secondLastName}
                  </span>
                </div>

                <span
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    backgroundColor: config.bg,
                    color: config.color,
                  }}
                >
                  {config.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Botón guardar */}
      <AppButton
        onClick={handleSave}
        isPending={isPending}
        pendingLabel="Guardando..."
        fullWidth
      >
        Guardar lista
      </AppButton>

      {/* Instrucción */}
      <p
        className="text-xs text-center mt-3"
        style={{ color: 'var(--color-text-disabled)' }}
      >
        Toca el nombre del alumno para cambiar su estado
      </p>
    </ProtectedPage>
  )
}