import BackButton from "@/components/BackButton"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { useClassDetail } from "@/hooks/useClassroom"
import api from "@/lib/api/axios"
import { useQuery } from "@tanstack/react-query"
import { useParams, useSearchParams } from "next/navigation"
import { useState } from "react"

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
  finalGrade: {
    calculatedScore: number
    finalScore: number | null
  } | null
  activities: ActivitySummary[]
  attendance: {
    present: number
    absent: number
    late: number
    excused: number
  }
}

export default function StudenSubjectSummaryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const studentId = params.id as string
  const subjectTermGroupId = params.subjectTermGroupId as string
  const academicTermId = searchParams.get('academicTermId') ?? ''

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const periods = cls?.academicTerm.periods ?? []

  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const activePeriodId = selectedPeriodId || periods[0]?.id

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

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'var(--color-success)'
    if (score >= 7) return 'var(--color-info)'
    if (score >= 6) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  const finalScore = summary?.finalGrade?.finalScore ?? summary?.finalGrade?.calculatedScore
  const totalAttendance = summary
    ? summary.attendance.present + summary.attendance.absent + summary.attendance.late + summary.attendance.excused
    : 0

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton href={`/dashboard/students/${studentId}`} />
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {summary?.subjectName ?? cls?.subject.name ?? '...'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.group.grade}°{cls?.group.letter} · {cls?.academicTerm.name}
          </p>
        </div>
      </div>

      {/* Selector de bimestres */}
      {periods.length > 0 && (
        <div className="flex gap-2 mb-6">
          {periods.map(period => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriodId(period.id)}
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
                Asistencias
              </h2>
              {totalAttendance > 0 && (
                <span
                  className="text-sm font-medium"
                  style={{
                    color: getScoreColor(
                      (summary.attendance.present / totalAttendance) * 10
                    ),
                  }}
                >
                  {Math.round((summary.attendance.present / totalAttendance) * 100)}% asistencia
                </span>
              )}
            </div>

            {totalAttendance === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                Sin registros de asistencia en este bimestre
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Presentes', value: summary.attendance.present, color: 'var(--color-success)', bg: 'rgba(16, 185, 129, 0.1)' },
                  { label: 'Ausentes', value: summary.attendance.absent, color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' },
                  { label: 'Tardanzas', value: summary.attendance.late, color: 'var(--color-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
                  { label: 'Justific.', value: summary.attendance.excused, color: 'var(--color-info)', bg: 'rgba(6, 182, 212, 0.1)' },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl p-3 flex flex-col items-center gap-1"
                    style={{
                      backgroundColor: item.bg,
                      border: `1px solid ${item.color}20`,
                    }}
                  >
                    <span
                      className="text-xl font-semibold"
                      style={{
                        color: item.color,
                        fontFamily: 'var(--font-geist)',
                      }}
                    >
                      {item.value}
                    </span>
                    <span className="text-xs text-center" style={{ color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ProtectedPage>
  )
}