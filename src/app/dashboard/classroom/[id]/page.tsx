'use client'

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import ProtectedPage from "@/components/ProtectedPage";
import ReportDialog from "@/components/ReportDialog";
import { DetailCardSkeleton } from "@/components/Skeleton";
import { DialogContent, DialogHeader, Dialog, DialogTitle } from "@/components/ui/dialog";
import { useClassDetail, useFinalGrades } from "@/hooks/useClassroom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useClassSchedule, useCreateSchedule, useDeleteSchedule } from "@/hooks/useSchedule";
import { usePreferencesStore } from "@/store/preferences.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Clock, FileWarning, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z, { endsWith } from "zod";


const scheduleSchema = z.object({
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().min(1, 'Selecciona una hora de inicio'),
  endTime: z.string().optional()
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

export default function ClassDetailPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const setSelectedPeriod = usePreferencesStore(s => s.setSelectedPeriod)
  const getSelectedPeriod = usePreferencesStore(s => s.getSelectedPeriod)

  const savePeriodId = getSelectedPeriod(subjectTermGroupId)
  const [selectedPeriod, setSelectedPeriodLocal] = useState(savePeriodId)

  const { data: cls, isLoading } = useClassDetail(subjectTermGroupId)
  const { data: finalGradesData } = useFinalGrades(subjectTermGroupId)
  const { data: schedules } = useClassSchedule(subjectTermGroupId)
  const { mutate: createSchedule, isPending: isCreatingSchedule } = useCreateSchedule(subjectTermGroupId)
  const { mutate: deleteSchedule } = useDeleteSchedule(subjectTermGroupId)
  const [openSchedule, setOpenSchedule] = useState(false)

  usePageTitle(cls ? `${cls.subject.name} · ${cls.group.grade}°${cls.group.letter}` : 'Clase')

  const [openReport, setOpenReport] = useState(false)
  const [reportStudent, setReportStudent] = useState<{
    id: string
    name: string
  } | null>(null)

  const activePeriod = selectedPeriod || cls?.academicTerm.periods?.[0]?.id

  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriodLocal(periodId)
    setSelectedPeriod(subjectTermGroupId, periodId)
  }

  const {
    register: registerSchedule,
    handleSubmit: handleSubmitSchedule,
    control: controlSchedule,
    formState: { errors: scheduleErrors },
    reset: resetSchedule
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
    }
  })

  const onSubmitSchedule = (data: ScheduleFormData) => {
    createSchedule({
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime || undefined
    }, {
      onSuccess: () => {
        setOpenReport(false)
        resetSchedule()
      }
    })
  }

  if (isLoading) {
    return (
      <ProtectedPage>
        <div className="flex flex-col gap-4">
          <DetailCardSkeleton />
          <DetailCardSkeleton />
          <DetailCardSkeleton />
        </div>
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BackButton href="/dashboard/classroom" />
        <div>
          <h1
            className="text-xl md:text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {cls?.subject.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.group.grade}°{cls?.group.letter} · {cls?.group.school.name} · {cls?.academicTerm.name}
          </p>
        </div>
      </div>

      {/* Selector de bimestres */}
      <div className="flex gap-2 mb-6">
        {cls?.academicTerm.periods?.map(period => (
          <button
            key={period.id}
            onClick={() => handlePeriodChange(period.id)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: activePeriod === period.id
                ? 'var(--color-primary)'
                : 'var(--color-bg-elevated)',
              border: `1px solid ${activePeriod === period.id
                ? 'var(--color-primary)'
                : 'var(--color-border)'}`,
              color: activePeriod === period.id
                ? 'white'
                : 'var(--color-text-secondary)',
            }}
          >
            B{period.number}
          </button>
        ))}
      </div>

      {/* Fechas del bimestre activo */}
      {cls?.academicTerm.periods?.find(p => p.id === activePeriod) && (
        <p
          className="text-xs mb-6 text-left"
          style={{ color: 'var(--color-text-disabled)' }}
        >
          {new Date(
            cls.academicTerm.periods.find(p => p.id === activePeriod)!.startDate
          ).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' → '}
          {new Date(
            cls.academicTerm.periods.find(p => p.id === activePeriod)!.endDate
          ).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      {/* Info del bimestre seleccionado */}
      {cls && activePeriod && (
        <div className="flex flex-col gap-3">
          {/* Sección horario */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                <h2
                  className="text-base font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Horario
                </h2>
              </div>
              <button
                onClick={() => setOpenSchedule(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors cursor-pointer"
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
                <Plus size={14} />
                Agregar
              </button>
            </div>

            {!schedules || schedules.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
                Sin horario configurado
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {schedules
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
                  .map(schedule => {
                    const days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
                    return (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-medium px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: 'var(--color-bg-primary)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {days[schedule.dayOfWeek]}
                          </span>
                          <span
                            className="text-sm"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {schedule.startTime}
                            {schedule.endTime && ` - ${schedule.endTime}`}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                          style={{ color: 'var(--color-text-disabled)' }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = 'var(--color-error)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--color-text-disabled)'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
          {/* Card de pasar lista */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/attendance`}>
            <div
              className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors"
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Pasar lista
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Registrar asistencia del día
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Card de actividades */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/periods/${activePeriod}/activities`}>
            <div
              className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors"
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Actividades
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Tareas, exámenes, proyectos
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Card de calificaciones */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/periods/${activePeriod}/grades`}>
            <div
              className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors"
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Calificaciones bimestrales
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Resumen y calificación final de cada alumno
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Resumen de alumnos */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p
              className="font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Alumnos ({cls.group.studentGroupTerms.length})
            </p>
            <div className="flex flex-col gap-2">
              {cls.group.studentGroupTerms.map(sgt => (
                <div
                  key={sgt.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {sgt.student.name[0]}{sgt.student.firstLastName[0]}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {sgt.student.name} {sgt.student.firstLastName} {sgt.student.secondLastName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setReportStudent({
                        id: sgt.student.id,
                        name: `${sgt.student.name} ${sgt.student.firstLastName}`,
                      })
                      setOpenReport(true)
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    style={{ color: 'var(--color-text-disabled)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--color-warning)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--color-text-disabled)'
                    }}
                  >
                    <FileWarning size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card de calificaciones finales - solo cuando todos los bimestres están cerrados */}
          {finalGradesData?.allClosed && (
            <Link href={`/dashboard/classroom/${subjectTermGroupId}/final`}>
              <div
                className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--color-success)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
                }}
              >
                <div>
                  <p
                    className="font-medium"
                    style={{ color: 'var(--color-success)' }}
                  >
                    Calificaciones finales
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-success)', opacity: 0.8 }}>
                    Todos los bimestres cerrados · Ver resumen anual
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-success)' }} />
              </div>
            </Link>
          )}
        </div>
      )}

      {reportStudent && (
        <ReportDialog
          open={openReport}
          onOpenChange={(val) => {
            setOpenReport(val)
            if (!val) setReportStudent(null)
          }}
          studentId={reportStudent.id}
          studentName={reportStudent.name}
          subjectTermGroupId={subjectTermGroupId}
        />
      )}

      {/* Modal agregar horario */}
      <Dialog
        open={openSchedule}
        onOpenChange={(val) => { setOpenSchedule(val); if (!val) resetSchedule() }}
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
              Agregar horario
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmitSchedule(onSubmitSchedule)}
            className="flex flex-col gap-4 mt-2"
          >
            {/* Día de la semana */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Día
              </label>
              <Controller
                name="dayOfWeek"
                control={controlSchedule}
                render={({ field }) => (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 1, label: 'Lun' },
                      { value: 2, label: 'Mar' },
                      { value: 3, label: 'Mié' },
                      { value: 4, label: 'Jue' },
                      { value: 5, label: 'Vie' },
                      { value: 6, label: 'Sáb' },
                      { value: 7, label: 'Dom' },
                    ].map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => field.onChange(day.value)}
                        className="py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === day.value
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === day.value
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === day.value
                            ? 'white'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Horas */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Hora inicio
                </label>
                <input
                  {...registerSchedule('startTime')}
                  type="time"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: `1px solid ${scheduleErrors.startTime
                      ? 'var(--color-error)'
                      : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = scheduleErrors.startTime
                      ? 'var(--color-error)'
                      : 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = scheduleErrors.startTime
                      ? 'var(--color-error)'
                      : 'var(--color-border)'
                  }}
                />
                {scheduleErrors.startTime && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {scheduleErrors.startTime.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Hora fin (opcional)
                </label>
                <input
                  {...registerSchedule('endTime')}
                  type="time"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                />
              </div>
            </div>

            <AppButton
              isPending={isCreatingSchedule}
              pendingLabel="Guardando..."
              fullWidth
            >
              Guardar horario
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedPage>

  )
}