'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import AppButton from './AppButton'
import { useCreateReport } from '@/hooks/useReports'

const reportSchema = z.object({
  reason: z.string().min(5, 'El motivo debe tener al menos 5 caracteres'),
  date: z.string().min(1, 'Selecciona una fecha'),
  notifyTutor: z.boolean().default(false).optional(),
})

type ReportFormData = z.infer<typeof reportSchema>

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  studentName: string
  subjectTermGroupId?: string
}

export default function ReportDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  subjectTermGroupId,
}: ReportDialogProps) {
  const { mutate: createReport, isPending } = useCreateReport(studentId)

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reason: '',
      date: today,
      notifyTutor: false,
    },
  })

  const notifyTutor = watch('notifyTutor')

  const onSubmit = (data: ReportFormData) => {
    createReport(
      {
        studentId,
        reason: data.reason,
        date: data.date,
        notifyTutor: data.notifyTutor,
        subjectTermGroupId,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) reset() }}>
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
            Crear reporte
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Alumno: <span style={{ color: 'var(--color-text-primary)' }}>{studentName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* Fecha */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Fecha del incidente
            </label>
            <input
              {...register('date')}
              type="date"
              className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: `1px solid ${errors.date ? 'var(--color-error)' : 'var(--color-border)'}`,
                color: 'var(--color-text-primary)',
                colorScheme: 'dark',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = errors.date
                  ? 'var(--color-error)'
                  : 'var(--color-primary)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.date
                  ? 'var(--color-error)'
                  : 'var(--color-border)'
              }}
            />
            {errors.date && (
              <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Motivo del reporte
            </label>
            <textarea
              {...register('reason')}
              placeholder="Describe el motivo del reporte..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none transition-colors resize-none"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: `1px solid ${errors.reason ? 'var(--color-error)' : 'var(--color-border)'}`,
                color: 'var(--color-text-primary)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = errors.reason
                  ? 'var(--color-error)'
                  : 'var(--color-primary)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = errors.reason
                  ? 'var(--color-error)'
                  : 'var(--color-border)'
              }}
            />
            {errors.reason && (
              <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Notificar tutor */}
          <button
            type="button"
            onClick={() => setValue('notifyTutor', !notifyTutor)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer"
            style={{
              backgroundColor: notifyTutor
                ? 'rgba(37, 99, 235, 0.1)'
                : 'var(--color-bg-tertiary)',
              border: `1px solid ${notifyTutor
                ? 'var(--color-primary)'
                : 'var(--color-border)'}`,
            }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{
                backgroundColor: notifyTutor ? 'var(--color-primary)' : 'transparent',
                border: `1.5px solid ${notifyTutor
                  ? 'var(--color-primary)'
                  : 'var(--color-border)'}`,
              }}
            >
              {notifyTutor && (
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
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Notificar al tutor
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--color-text-disabled)' }}
              >
                Funcionalidad de mensajería próximamente
              </p>
            </div>
          </button>

          <AppButton isPending={isPending} pendingLabel="Guardando..." fullWidth>
            Guardar reporte
          </AppButton>
        </form>
      </DialogContent>
    </Dialog>
  )
}