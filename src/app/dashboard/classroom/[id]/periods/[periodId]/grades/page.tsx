'use client'

import AppButton from "@/components/AppButton"
import BackButton from "@/components/BackButton"
import ConfirmDialog from "@/components/ConfirmDialog"
import { OverrideToolTip } from "@/components/OverrideToolTip"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useClassDetail, useOverrideFinalGrade, usePeriodGrades, useTogglePeriodClose } from "@/hooks/useClassroom"
import { zodResolver } from "@hookform/resolvers/zod"
import { LockOpen, Pencil, Lock } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"

const overrideSchema = z.object({
  finalScore: z.number()
    .min(0, 'Minimo 0')
    .max(10, 'Máximo 10'),
  overrideReason: z.string().optional()
})

type OverrideFormData = z.infer<typeof overrideSchema>

export default function PeriodGradesPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const periodId = params.periodId as string

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const { data: grades, isLoading } = usePeriodGrades(subjectTermGroupId, periodId)
  const { mutate: overrideGrade, isPending } = useOverrideFinalGrade()
  const { mutate: toggleClose, isPending: isToggling } = useTogglePeriodClose(subjectTermGroupId, periodId)

  const [openOverride, setOpenOverride] = useState(false)
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [confirmClose, setConfirmClose] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<OverrideFormData>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      finalScore: 0,
      overrideReason: ''
    }
  })

  const period = cls?.academicTerm.periods?.find(p => p.id === periodId)
  const isClosed = grades && grades.length > 0 && grades.every(g => g.closed)
  const hasGrades = grades && grades.length > 0

  const handleOpenOverride = (gradeId: string, currentScore: number) => {
    setSelectedGradeId(gradeId)
    setValue('finalScore', currentScore)
    setValue('overrideReason', '')
    setOpenOverride(true)
  }

  const onSubmit = (data: OverrideFormData) => {
    if (!selectedGradeId) return

    overrideGrade({
      finalGradeId: selectedGradeId,
      finalScore: data.finalScore,
      overrideReason: data.overrideReason || undefined
    }, {
      onSuccess: () => {
        setOpenOverride(false)
        setSelectedGradeId(null)
        reset()
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
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex gap-2 items-center">
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

        {/* Botón cerrar/reabrir */}
        {hasGrades && (
          <button
            onClick={() => setConfirmClose(true)}
            disabled={isToggling}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            style={{
              backgroundColor: isClosed
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${isClosed
                ? 'var(--color-success)'
                : 'var(--color-error)'}`,
              color: isClosed
                ? 'var(--color-success)'
                : 'var(--color-error)',
            }}
          >
            {isClosed
              ? <><LockOpen size={14} /> Reabrir</>
              : <><Lock size={14} /> Cerrar</>
            }
          </button>
        )}
      </div>

      {/* Banner de bimestre cerrado */}
      {isClosed && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid var(--color-success)',
          }}
        >
          <Lock size={16} style={{ color: 'var(--color-success)' }} />
          <p className="text-sm" style={{ color: 'var(--color-success)' }}>
            Este bimestre está cerrado. Las calificaciones no se pueden modificar.
          </p>
        </div>
      )}

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
          className="rounded-2xl mt-6"
          style={{ border: '1px solid var(--color-border)' }}
        >
          {/* Header */}
          <div
            className="rounded-t-2xl grid grid-cols-12 px-4 py-3 text-xs font-medium uppercase tracking-wider"
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
                className={`grid grid-cols-12 items-center px-4 py-3 ${isLast} ? 'rounded-b-2xl' : ''`}
                style={{
                  backgroundColor: index % 2 === 0
                    ? 'var(--color-bg-elevated)'
                    : 'var(--color-bg-secondary)',
                  borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
                  bordertop
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
                <div className="col-span-2 text-center position">
                  <span
                    className="text-sm font-medium"
                    style={{ color: getScoreColor(finalScore) }}
                  >
                    {finalScore}
                    {isOverridden && (
                      <OverrideToolTip
                        overrideReason={grade.overrideReason}
                        overridedAt={grade.overrideAt}
                      >

                        <span
                          className="ml-1  text-xs group cursor-pointer"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          *
                        </span>
                      </OverrideToolTip>
                    )}
                  </span>
                </div>

                {/* Editar */}
                <div className="col-span-2 flex justify-center">
                  {isClosed ? (
                    <Lock size={14} style={{ color: 'var(--color-text-disabled' }} />
                  ) : (
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

                  )}
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
      <Dialog
        open={openOverride}
        onOpenChange={
          (val) => {
            setOpenOverride(val)
            if (!val) reset()
          }}
      >
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

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Calificación final
              </label>
              <input
                {...register('finalScore', { valueAsNumber: true })}
                type="number"
                min={0}
                max={10}
                step={0.1}
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.finalScore ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                  colorScheme: 'dark',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.finalScore
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.finalScore
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.finalScore && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.finalScore.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Motivo (opcional)
              </label>
              <input
                {...register('overrideReason')}
                placeholder="Ej. Trabajo extra, error de captura..."
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              />
            </div>

            <AppButton
              fullWidth
              isPending={isPending}
              pendingLabel="Guardando..."
            >
              Guardar calificación
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm cerrar/reabrir */}
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title={isClosed ? 'Reabrir bimestre' : 'Cerrar bimestre'}
        description={
          isClosed
            ? 'Al reabrir el bimestre podrás modificar las calificaciones nuevamente.'
            : 'Al cerrar el bimestre las calificaciones quedarán bloqueadas. Podrás reabrirlo cuando necesites hacer cambios.'
        }
        confirmLabel={isClosed ? 'Reabrir' : 'Cerrar'}
        onConfirm={() => {
          toggleClose(!isClosed)
          setConfirmClose(false)
        }}
      />

    </ProtectedPage>
  )
}