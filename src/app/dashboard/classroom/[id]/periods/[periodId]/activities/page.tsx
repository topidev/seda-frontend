'use client'

import AppButton from "@/components/AppButton"
import BackButton from "@/components/BackButton"
import ConfirmDialog from "@/components/ConfirmDialog"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { DialogContent, DialogHeader, Dialog, DialogTitle } from "@/components/ui/dialog"
import { useActivities, useClassDetail, useCreateActivity, useDeleteActivity } from "@/hooks/useClassroom"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"

const createActivitySchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  maxScore: z.number().min(1, 'El valor debe ser mayor a 0'),
  dueDate: z.string().optional(),
})

type CreateActivityFormData = z.infer<typeof createActivitySchema>

export default function ActivitiesPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const periodId = params.periodId as string

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const { data: activities, isLoading } = useActivities(cls?.subject.id ?? '', periodId, subjectTermGroupId)
  const { mutate: createActivity, isPending } = useCreateActivity(subjectTermGroupId, periodId)
  const { mutate: deleteActivity } = useDeleteActivity(subjectTermGroupId, periodId)

  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const period = cls?.academicTerm.periods?.find(p => p.id === periodId)
  const categories = cls?.subject.gradeCategories ?? []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      maxScore: 10,
      dueDate: ''
    }
  })

  const onSubmit = (data: CreateActivityFormData) => {
    createActivity(
      {
        title: data.title,
        description: data.description || undefined,
        categoryId: data.categoryId,
        maxScore: data.maxScore,
        dueDate: data.dueDate || undefined
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        }
      }
    )
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    })

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BackButton href={`/dashboard/classroom/${subjectTermGroupId}`} />
        <div className="flex-1">
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Actividades
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.subject.name} · {cls?.group.grade}°{cls?.group.letter} · Bimestre {period?.number}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <Spinner />}

      {/* Lista vacía */}
      {!isLoading && activities?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4 mt-6"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No hay actividades en este bimestre
          </p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Crear primera actividad
          </button>
        </div>
      )}

      {/* Lista de actividades */}
      {!isLoading && activities && activities.length > 0 && (
        <div className="flex flex-col gap-3 mt-6">
          {activities.map(activity => {
            const gradedCount = activity.grades.filter(
              g => g.score !== null || g.didNotSubmit,
            ).length
            const totalStudents = cls?.group.studentGroupTerms.length ?? 0

            return (
              <div
                key={activity.id}
                className="rounded-2xl p-4 md:p-5"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-lg"
                        style={{
                          backgroundColor: 'var(--color-bg-tertiary)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        {activity.category.name}
                      </span>
                      {activity.dueDate && (
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          {formatDate(activity.dueDate)}
                        </span>
                      )}
                    </div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {activity.title}
                    </p>
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {gradedCount}/{totalStudents} calificados · valor: {activity.maxScore} pts
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-end justify-end md:items-center md:justify-center gap-2">
                    <Link
                      href={`/dashboard/classroom/${subjectTermGroupId}/periods/${periodId}/activities/${activity.id}/grade`}
                    >
                      <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors"
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
                        Calificar
                        <ChevronRight size={14} />
                      </button>
                    </Link>
                    <button
                      onClick={() => setConfirmId(activity.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                      style={{ color: 'var(--color-text-disabled)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--color-error)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--color-text-disabled)'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nueva actividad */}
      <Dialog open={open} onOpenChange={
        (val) => {
          setOpen(val)
          if (!val) reset()
        }
      }>
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
              Nueva actividad
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
            {/* Título */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Título
              </label>
              <input
                {...register('title')}
                placeholder="Ej. Tarea 1, Examen parcial"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.title ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.title
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.title
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.title && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Descripción (opcional)
              </label>
              <input
                {...register('description')}
                placeholder="Instrucciones o detalles"
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

            {/* Categoría */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Categoría
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          field.onChange(cat.id)
                        }}
                        className="px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === cat.id
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === cat.id
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === cat.id
                            ? 'white'
                            : 'var(--color-text-secondary)',
                        }}
                      >
                        {cat.name} ({cat.percentage}%)
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.categoryId && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Valor y fecha */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Valor máximo
                </label>
                <input
                  {...register('maxScore', {
                    valueAsNumber: true,
                  })}
                  min={1}
                  type="number"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: `1px solid ${errors.maxScore ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = errors.maxScore
                      ? 'var(--color-error)'
                      : 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors.maxScore
                      ? 'var(--color-error)'
                      : 'var(--color-border)'
                  }}
                />
                {errors.maxScore && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {errors.maxScore.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Fecha de entrega
                </label>
                <input
                  {...register('dueDate')}
                  type="date"
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
              fullWidth
              type="submit"
              isPending={isPending}
              pendingLabel="Creando..."
            >
              Crear actividad
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={open => { if (!open) setConfirmId(null) }}
        title="Eliminar actividad"
        description="¿Seguro que deseas eliminar esta actividad? Se perderán todas las calificaciones asociadas."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmId) {
            deleteActivity(confirmId)
            setConfirmId(null)
          }
        }}
      />
    </ProtectedPage>
  )

}