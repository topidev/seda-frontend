'use client'

import BackButton from "@/components/BackButton"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { useClassDetail } from "@/hooks/useClassroom"
import api from "@/lib/api/axios"
import { exportStudentSummary } from "@/lib/excel/exportStudentSummary"
import { usePreferencesStore } from "@/store/preferences.store"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface AttendanceEntry {
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
}

interface ActivitySummary {
  id: string
  title: string
  categoryName: string
  categoryPercentage: number
  maxScore: number
  score: number | null
  didNotSubmit: boolean
}

interface SubjectSummary {
  subjectName: string
  periodDates: {
    startDate: string
    endDate: string
  }
  finalGrade: {
    calculatedScore: number
    finalScore: number | null
  } | null
  activities: ActivitySummary[]
  attendance: AttendanceEntry[]
}

export default function StudenSubjectSummaryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const studentId = params.id as string
  const subjectTermGroupId = params.subjectTermGroupId as string
  const academicTermId = searchParams.get('academicTermId') ?? ''

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const periods = cls?.academicTerm.periods ?? []

  const setSelectedPeriod = usePreferencesStore(s => s.setSelectedPeriod)
  const getSelectedPeriod = usePreferencesStore(s => s.getSelectedPeriod)

  const savePeriodId = getSelectedPeriod(subjectTermGroupId)
  const [selectedPeriod, setSelectedPeriodLocal] = useState(savePeriodId)

  // const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const activePeriodId = selectedPeriod || periods[0]?.id

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodLocal(periodId)
    setSelectedPeriod(subjectTermGroupId, periodId)
  }

  const { data: summary, isLoading } = useQuery({
    queryKey: ['student-summary', studentId, subjectTermGroupId, activePeriodId],
    queryFn: async () => {
      const { data } = await api.get<SubjectSummary>(
        `/students/${studentId}/subjects/${subjectTermGroupId}/summary`,
        { params: { periodId: activePeriodId } },
      )
      return data
    },
    enabled: !!activePeriodId
  })

  const { data: student } = useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      const { data } = await api.get(`/students/${studentId}`)
      return data
    },
    enabled: !!studentId
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { data } = await api.get(
        `/students/${studentId}/subjects/${subjectTermGroupId}/full-summary`
      )

      exportStudentSummary({
        studentName: data.studentName,
        subjectName: data.subjectName,
        groupName: `${cls?.group.grade}°${cls?.group.letter}`,
        academicTermName: data.academicTermName,
        periods: data.periods
      })
    }
    catch {
      toast.error('Error al generar el archivo')
    }
    finally {
      setIsExporting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'var(--color-success)'
    if (score >= 7) return 'var(--color-info)'
    if (score >= 6) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const finalScore = summary?.finalGrade?.finalScore ?? summary?.finalGrade?.calculatedScore
  const totalAttendance = summary?.attendance.length ?? 0

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton href={`/dashboard/students/${studentId}`} />
        <div className="flex-1">
          <h1
            className="text-xl md:text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {summary?.subjectName ?? cls?.subject.name ?? '...'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {student ?
              `${student.name} ${student.firstLastName} ${student.secondLastName ?? ''} · `
              : ''}
            {cls?.group.grade}°{cls?.group.letter}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {summary?.periodDates && (
              <span style={{ color: 'var(--color-text-disabled)' }}>
                {new Date(summary.periodDates.startDate).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {' → '}
                {new Date(summary.periodDates.endDate).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                · {cls?.academicTerm.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: isExporting ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!isExporting) {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!isExporting) {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
              }
            }}
          >
            <Download size={14} />
            {isExporting ? 'Generando...' : 'Exportar'}
          </button>
        </div>
      </div>

      {/* Selector de bimestres */}
      {periods.length > 0 && (
        <div className="flex gap-2 mb-6">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => handlePeriodChange(period.id)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: activePeriodId === period.id
                  ? 'var(--color-primary)'
                  : 'var(--color-bg-elevated)',
                border: `1px solid ${activePeriodId === period.id
                  ? 'var(--color-primary)'
                  : 'var(--color-border)'}`,
                color: activePeriodId === period.id
                  ? 'white'
                  : 'var(--color-text-secondary)',
              }}
            >
              B{period.number}
            </button>
          ))}
        </div>
      )}

      {isLoading && <Spinner />}

      {!isLoading && summary && (
        <div className="flex flex-col gap-4">

          {/* Calificación bimestral */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2
              className="text-base font-medium mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Calificación bimestral
            </h2>

            {summary.finalGrade ? (
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Calculada
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{
                      color: getScoreColor(summary.finalGrade.calculatedScore),
                      fontFamily: 'var(--font-geist)',
                    }}
                  >
                    {summary.finalGrade.calculatedScore}
                  </p>
                </div>

                {summary.finalGrade.finalScore !== null && (
                  <div className="flex flex-col gap-1 items-end">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Final (editada)
                    </p>
                    <p
                      className="text-2xl font-semibold"
                      style={{
                        color: getScoreColor(summary.finalGrade.finalScore),
                        fontFamily: 'var(--font-geist)',
                      }}
                    >
                      {summary.finalGrade.finalScore}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                Sin calificación registrada en este bimestre
              </p>
            )}
          </div>

          {/* Actividades */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2
              className="text-base font-medium mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Actividades ({summary.activities.length})
            </h2>

            {summary.activities.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                Sin actividades en este bimestre
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {summary.activities.map(activity => {
                  const scoreColor = activity.didNotSubmit
                    ? 'var(--color-error)'
                    : activity.score !== null
                      ? getScoreColor((activity.score / activity.maxScore) * 10)
                      : 'var(--color-text-disabled)'

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {activity.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          {activity.categoryName} · {activity.categoryPercentage}%
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-0.5">
                        <p
                          className="text-sm font-medium"
                          style={{ color: scoreColor }}
                        >
                          {activity.didNotSubmit
                            ? 'No entregó'
                            : activity.score !== null
                              ? `${activity.score}/${activity.maxScore}`
                              : 'Sin calificar'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Asistencias */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Asistencias ({totalAttendance})
              </h2>
              {totalAttendance > 0 && (
                <span
                  className="text-sm font-medium"
                  style={{
                    color: getScoreColor(
                      (summary.attendance.filter(a => a.status === 'PRESENT').length / summary.attendance.length) * 10
                    ),
                  }}
                >
                  {Math.round((summary.attendance.filter(a => a.status === 'PRESENT').length / summary.attendance.length) * 100)}% asistencia
                </span>
              )}
            </div>

            {totalAttendance === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                Sin registros de asistencia en este bimestre
              </p>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--color-border)' }}
              >
                {/* Header tabla */}
                <div
                  className="grid grid-cols-8 px-3 py-2 text-xs font-medium uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-text-disabled)',
                  }}
                >
                  <span className="col-span-4">Fecha</span>
                  <span className="col-span-1 text-center">P</span>
                  <span className="col-span-1 text-center">A</span>
                  <span className="col-span-1 text-center">T</span>
                  <span className="col-span-1 text-center">J</span>
                </div>

                {/* Filas */}
                {summary.attendance.map((entry, index) => {
                  const isLast = index === summary.attendance.length - 1
                  const statusColors: Record<string, string> = {
                    PRESENT: 'var(--color-success)',
                    ABSENT: 'var(--color-error)',
                    LATE: 'var(--color-warning)',
                    EXCUSED: 'var(--color-info)',
                  }

                  return (
                    <div
                      key={entry.date}
                      className="grid grid-cols-8 items-center px-3 py-2.5"
                      style={{
                        backgroundColor: index % 2 === 0
                          ? 'var(--color-bg-elevated)'
                          : 'var(--color-bg-secondary)',
                        borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
                      }}
                    >
                      {/* Fecha */}
                      <span
                        className="col-span-4 text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {new Date(entry.date).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      {/* Columnas de estado */}
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
                        <div key={status} className="col-span-1 flex justify-center">
                          {entry.status === status ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: statusColors[status] }}
                            >
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div
                              className="w-5 h-5 rounded-full"
                              style={{
                                border: '1.5px solid var(--color-border)',
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedPage>
  )
}