'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import BackButton from '@/components/BackButton'
import AppButton from '@/components/AppButton'
import { useClassDetail, useActivities, useGradeActivity } from '@/hooks/useClassroom'
import z from 'zod'

export default function GradeActivityPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const periodId = params.periodId as string
  const activityId = params.activityId as string

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const { data: activities } = useActivities(subjectTermGroupId, periodId)
  const { mutate: gradeActivity, isPending } = useGradeActivity(activityId)

  const activity = activities?.find(a => a.id === activityId)
  const students = cls?.group.studentGroupTerms ?? []

  // Estado local de calificaciones
  const [grades, setGrades] = useState<Record<string, { score: string; didNotSubmit: boolean }>>({})

  // Inicializa con calificaciones existentes
  useEffect(() => {
    if (!students.length) return

    const initial: Record<string, { score: string; didNotSubmit: boolean }> = {}

    students.forEach(sgt => {
      const existing = activity?.grades.find(g => g.studentId === sgt.studentId)
      initial[sgt.studentId] = {
        score: existing?.score?.toString() ?? '',
        didNotSubmit: existing?.didNotSubmit ?? false,
      }
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrades(initial)
  }, [students.length, activity])

  const handleScoreChange = (studentId: string, score: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], score },
    }))
  }

  const handleDidNotSubmit = (studentId: string, checked: boolean) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { score: checked ? '0' : '', didNotSubmit: checked },
    }))
  }

  const handleSave = async () => {
    const payload = students.map(sgt => ({
      studentId: sgt.studentId,
      score: grades[sgt.studentId]?.didNotSubmit
        ? 0
        : Number(grades[sgt.studentId]?.score) || 0,
      didNotSubmit: grades[sgt.studentId]?.didNotSubmit ?? false,
    }))

    gradeActivity(payload)
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BackButton
          href={`/dashboard/classroom/${subjectTermGroupId}/periods/${periodId}/activities`}
        />
        <div className="flex-1">
          <h1
            className="text-xl md:text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {activity?.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.subject.name} · {cls?.group.grade}°{cls?.group.letter} · valor: {activity?.maxScore} pts
          </p>
        </div>
      </div>

      {/* Tabla de calificaciones */}
      <div
        className="rounded-2xl overflow-hidden mt-6"
        style={{
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Header de tabla */}
        <div
          className="grid grid-cols-12 px-4 py-3 text-xs font-medium uppercase tracking-wider"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-disabled)',
          }}
        >
          <span className="col-span-6">Alumno</span>
          <span className="col-span-2 text-center">Calif.</span>
          <span className="col-span-4 text-center">No entregó</span>
        </div>

        {/* Filas de alumnos */}
        {students.map((sgt, index) => {
          const grade = grades[sgt.studentId]
          const isLast = index === students.length - 1

          return (
            <div
              key={sgt.studentId}
              className="grid grid-cols-12 items-center px-4 py-3"
              style={{
                backgroundColor: index % 2 === 0
                  ? 'var(--color-bg-elevated)'
                  : 'var(--color-bg-secondary)',
                borderBottom: isLast
                  ? 'none'
                  : '1px solid var(--color-divider)',
              }}
            >
              {/* Nombre */}
              <div className="col-span-6 flex items-center gap-3">
                {/* <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {sgt.student.name[0]}{sgt.student.firstLastName[0]}
                </div> */}
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {sgt.student.name} {sgt.student.firstLastName}
                </span>
              </div>

              {/* Calificación */}
              <div className="col-span-2 flex justify-center">
                <input
                  type="number"
                  value={grade?.score ?? ''}
                  onChange={e => handleScoreChange(sgt.studentId, e.target.value)}
                  disabled={grade?.didNotSubmit}
                  min={0}
                  max={activity?.maxScore}
                  step={0.5}
                  className="w-20 text-center px-2 py-1.5 rounded-lg outline-none transition-colors"
                  style={{
                    backgroundColor: grade?.didNotSubmit
                      ? 'var(--color-bg-tertiary)'
                      : 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    color: grade?.didNotSubmit
                      ? 'var(--color-text-disabled)'
                      : 'var(--color-text-primary)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => {
                    if (!grade?.didNotSubmit) {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                />
              </div>

              {/* No entregó */}
              <div className="col-span-4 flex justify-center">
                <button
                  onClick={() => handleDidNotSubmit(sgt.studentId, !grade?.didNotSubmit)}
                  className="w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: grade?.didNotSubmit
                      ? 'var(--color-error)'
                      : 'transparent',
                    border: `1.5px solid ${grade?.didNotSubmit
                      ? 'var(--color-error)'
                      : 'var(--color-border)'}`,
                  }}
                >
                  {grade?.didNotSubmit && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Botón guardar */}
      <div className="mt-6">
        <AppButton
          type='button'
          onClick={handleSave}
          isPending={isPending}
          pendingLabel="Guardando..."
          fullWidth
        >
          Guardar calificaciones
        </AppButton>
      </div>
    </ProtectedPage>
  )
}