'use client'

import AppButton from "@/components/AppButton"
import AppInput from "@/components/AppInput"
import BackButton from "@/components/BackButton"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useClassDetail, useOverrideFinalGrade, usePeriodGrades } from "@/hooks/useClassroom"
import { Pencil } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function PeriodGradesPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const periodId = params.periodId as string

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const { data: grades, isLoading } = usePeriodGrades(subjectTermGroupId, periodId)
  const { mutate: overrideGrade, isPending } = useOverrideFinalGrade()

  const [openOverride, setOpenOverride] = useState(false)
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [overrideScore, setOverrideScore] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  const period = cls?.academicTerm.periods?.find(p => p.id === periodId)

  const handleOpenOverride = (gradeId: string, currentScore: number) => {
    setSelectedGradeId(gradeId)
    setOverrideScore(currentScore.toString())
    setOverrideReason('')
    setOpenOverride(true)
  }

  const handleOverride = () => {
    if (!selectedGradeId || !overrideScore) return

    overrideGrade({
      finalGradeId: selectedGradeId,
      finalScore: Number(overrideScore),
      overrideReason: overrideReason || undefined
    }, {
      onSuccess: () => {
        setOpenOverride(false)
        setSelectedGradeId(null)
      }
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'var(--color-success)'
    if (score >= 7) return 'var(--color-info)'
    if (score >= 6) return 'var(--color-warning)'
    return 'var(--color-error)'
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BackButton href={`/dashboard/classroom/${subjectTermGroupId}`} />
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Calificaciones bimestrales
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.subject.name} · {cls?.group.grade}°{cls?.group.letter} · Bimestre {period?.number}
          </p>
        </div>
      </div>

      {isLoading && <Spinner />}

      {/* Sin calificaciones */}
      {!isLoading && grades?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3 mt-6"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Aún no hay calificaciones calculadas
          </p>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-disabled)' }}>
            Las calificaciones se calculan automáticamente al calificar actividades
          </p>
        </div>
      )}

      {/* Tabla de calificaciones */}
      {!isLoading && grades && grades.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden mt-6"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-12 px-4 py-3 text-xs font-medium uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-disabled)',
            }}
          >
            <span className="col-span-6">Alumno</span>
            <span className="col-span-2 text-center">Calculada</span>
            <span className="col-span-2 text-center">Final</span>
            <span className="col-span-2 text-center">Editar</span>
          </div>

          {/* Filas */}
          {grades.map((grade, index) => {
            const finalScore = grade.finalScore ?? grade.calculatedScore
            const isOverridden = grade.finalScore !== null
            const isLast = index === grades.length - 1

            return (
              <div
                key={grade.id}
                className="grid grid-cols-12 items-center px-4 py-3"
                style={{
                  backgroundColor: index % 2 === 0
                    ? 'var(--color-bg-elevated)'
                    : 'var(--color-bg-secondary)',
                  borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
                }}
              >
                {/* Nombre */}
                <div className="col-span-6 flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {grade.student.name[0]}{grade.student.firstLastName[0]}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {grade.student.name} {grade.student.firstLastName}
                  </span>
                </div>

                {/* Calculada */}
                <div className="col-span-2 text-center">
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {grade.calculatedScore}
                  </span>
                </div>

                {/* Final */}
                <div className="col-span-2 text-center">
                  <span
                    className="text-sm font-medium"
                    style={{ color: getScoreColor(finalScore) }}
                  >
                    {finalScore}
                    {isOverridden && (
                      <span
                        className="ml-1 text-xs"
                        style={{ color: 'var(--color-text-disabled)' }}
                      >
                        *
                      </span>
                    )}
                  </span>
                </div>

                {/* Editar */}
                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => handleOpenOverride(grade.id, finalScore)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    style={{ color: 'var(--color-text-disabled)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--color-primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-text-disabled)'
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Leyenda */}
      {grades && grades.length > 0 && (
        <p
          className="text-xs mt-3"
          style={{ color: 'var(--color-text-disabled)' }}
        >
          * Calificación editada manualmente
        </p>
      )}

      {/* Modal override */}
      <Dialog open={openOverride} onOpenChange={setOpenOverride}>
        <DialogContent
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-geist)',
                textTransform: 'none',
              }}
            >
              Editar calificación final
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <AppInput
              label="Calificación final"
              value={overrideScore}
              onChange={setOverrideScore}
              type="number"
              min={0}
              max={10}
            />
            <AppInput
              label="Motivo (opcional)"
              value={overrideReason}
              onChange={setOverrideReason}
              placeholder="Ej. Trabajo extra, error de captura..."
            />

            <AppButton
              onClick={handleOverride}
              disabled={!overrideScore}
              isPending={isPending}
              pendingLabel="Guardando..."
              fullWidth
            >
              Guardar calificación
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}