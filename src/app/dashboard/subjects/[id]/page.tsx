'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import {
  useSubject,
  useCreateGradeCategory,
  useDeleteGradeCategory,
} from '@/hooks/useSubjects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import BackButton from '@/components/BackButton'
import AppButton from '@/components/AppButton'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
// import { queryClient } from '@/lib/query-client'
import ConfirmDialog from '@/components/ConfirmDialog'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActivities, useCreateActivity, useDeleteActivity, useMyClasses } from '@/hooks/useClassroom'
import Spinner from '@/components/Spinner'
import { usePreferencesStore } from '@/store/preferences.store'

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string
  const queryClient = useQueryClient()

  const setSelectedPeriod = usePreferencesStore(s => s.setSelectedPeriod)
  const getSelectedPeriod = usePreferencesStore(s => s.getSelectedPeriod)

  const { data: subject, isLoading } = useSubject(subjectId)
  const { data: classes } = useMyClasses()
  const { mutate: createCategory, isPending, isError } = useCreateGradeCategory(subjectId)
  const { mutate: deleteCategory } = useDeleteGradeCategory(subjectId)

  // const savePeriodId = getSelectedPeriod(subjectTermGroupId)
  // const [selectedPeriod, setSelectedPeriodLocal] = useState(savePeriodId)

  const [open, setOpen] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')
  const [openActivity, setOpenActivity] = useState(false)
  const [confirmActivityId, setConfirmActivityId] = useState<string | null>(null)


  const subjectClass = classes?.find(c => c.subject.id === subjectId)
  const periods = subjectClass?.academicTerm.periods ?? []
  const activePeriodId = selectedPeriodId || periods[0]?.id
  const activeStgId = subjectClass?.id ?? ''

  const { data: activities, isLoading: isLoadingActivities } = useActivities(subjectId, activePeriodId, activeStgId)
  const { mutate: createActivity, isPending: isCreatingActivity } = useCreateActivity(activeStgId, activePeriodId)
  const { mutate: deleteActivity } = useDeleteActivity(activeStgId, activePeriodId)


  const totalPercentage = subject?.gradeCategories.reduce(
    (sum, c) => sum + c.percentage, 0,
  ) ?? 0

  const availablePercentage = 100 - totalPercentage

  const createCategorySchema = z.object({
    categoryName: z.string().min(2, 'Mímino dos caracteres'),
    percentage: z.number()
      .min(5, 'Mínimo 5%')
      .max(availablePercentage, `Máximo ${availablePercentage}% disponible`)
  })
  type CreateCategoryFormData = z.infer<typeof createCategorySchema>

  const createActivitySchema = z.object({
    title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
    description: z.string().optional(),
    categoryId: z.string().min(1, 'Selecciona una categoría'),
    maxScore: z.number().min(1, 'El valor debe ser mayor a 0').default(10).optional(),
    dueDate: z.string().optional(),
  })
  type CreateActivityFormData = z.infer<typeof createActivitySchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      categoryName: '',
      percentage: 0
    },
    mode: 'onChange'
  })

  const {
    register: registerActivity,
    handleSubmit: handleSubmitActivity,
    control: controlActivity,
    formState: { errors: activityErrors },
    reset: resetActivity
  } = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      maxScore: 10,
      dueDate: '',
    }
  })

  const onSubmitActivity = (data: CreateActivityFormData) => {
    createActivity({
      title: data.title,
      description: data.description || undefined,
      categoryId: data.categoryId,
      maxScore: data.maxScore,
      dueDate: data.dueDate || undefined,
    }, {
      onSuccess: () => {
        setOpenActivity(false)
        resetActivity()
      }
    })
  }


  const { mutate: removeSubject } = useMutation({
    mutationFn: async () => {
      await api.delete(`/subjects/${subjectId}`)
    },
    onSuccess: () => {
      toast.success('Materia Eliminada')
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      router.replace('/dashboard/subjects')
    },
    onError: () => {
      toast.error('Error borrando materia')
    }
  })

  const onSubmit = (data: CreateCategoryFormData) => {
    createCategory(
      { name: data.categoryName, percentage: data.percentage },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 w-full">
        <BackButton href="/dashboard/subjects" />
        {subject && (
          <div className='flex items-center justify-between w-full'>
            <div>
              <h1
                className="text-xl md:text-2xl font-semibold"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-geist)',
                }}
              >
                {isLoading ? '...' : subject?.name}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {subject?._count?.subjectTermGroups ?? 0} grupos asignados
              </p>
            </div>
            <div>
              <button
                onClick={() => setOpenConfirm(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-error)'
                  e.currentTarget.style.color = 'var(--color-error)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sección categorías */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-lg font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Categorías de ponderación
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Total:{' '}
              <span
                style={{
                  color: totalPercentage === 100
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
                  fontWeight: 500,
                }}
              >
                {totalPercentage}%
              </span>
              {' '}de 100%
            </p>
          </div>

          {totalPercentage < 100 && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
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
              Agregar categoría
            </button>
          )}
        </div>

        {/* Lista de categorías */}
        {subject?.gradeCategories.length === 0 && (
          <p
            className="text-sm py-4 text-center"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            Aún no hay categorías. Agrega tareas, exámenes, proyectos...
          </p>
        )}

        <div className="flex flex-col gap-2">
          {subject?.gradeCategories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {category.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {category.percentage}%
                </span>
                <button
                  onClick={() => deleteCategory(category.id)}
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
            </div>
          ))}
        </div>

        {/* Barra de progreso de ponderación */}
        {subject && subject.gradeCategories.length > 0 && (
          <div
            className="mt-4 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${totalPercentage}%`,
                backgroundColor: totalPercentage === 100
                  ? 'var(--color-success)'
                  : 'var(--color-primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Sección actividades */}
      {subjectClass && (
        <div
          className="rounded-2xl p-6 mt-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Actividades
            </h2>
            <button
              onClick={() => setOpenActivity(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
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
              Nueva actividad
            </button>
          </div>

          {/* Selector de bimestres */}
          {periods.length > 0 && (
            <div className="flex gap-2 mb-4">
              {periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriodId(period.id)}
                  className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: activePeriodId === period.id
                      ? 'var(--color-primary)'
                      : 'var(--color-bg-tertiary)',
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

          {/* Lista de actividades */}
          {isLoadingActivities && <Spinner />}

          {!isLoadingActivities && activities?.length === 0 && (
            <p
              className="text-sm py-4 text-center"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              No hay actividades en este bimestre
            </p>
          )}

          {!isLoadingActivities && activities && activities.length > 0 && (
            <div className="flex flex-col gap-2">
              {activities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <div>
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
                      {activity.category.name} · {activity.maxScore} pts
                      {activity.dueDate && ` · ${new Date(activity.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmActivityId(activity.id)}
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal nueva categoría */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          style={{
            maxHeight: '90vh',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
          }}
          className="sm:p-[22px] md:p-3 sm:max-w-[425px] md:max-w-[500px]"
        >
          <DialogHeader>
            <DialogTitle
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-geist)',
              }}
            >
              Nueva categoría
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Nombre
              </label>
              <input
                {...register('categoryName')}
                placeholder="Ej. Tareas, Examen, Proyectos"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.categoryName ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.categoryName
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.categoryName
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.categoryName && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.categoryName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Porcentaje (disponible: {availablePercentage}%)
              </label>
              <input
                {...register('percentage', {
                  valueAsNumber: true,
                  min: 5,
                  max: availablePercentage
                })}
                type="number"
                placeholder="Ej. 30"
                min={5}
                max={availablePercentage}
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.percentage ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.percentage
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.percentage
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {errors.percentage && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.percentage.message}
                </p>
              )}
            </div>

            {isError && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                Error al crear la categoría. Verifica que el porcentaje no supere el disponible.
              </p>
            )}

            <AppButton
              fullWidth
              isPending={isPending}
              pendingLabel='Guardando'
            >
              Guardar categoría
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title='Eliminar Materia'
        description={`
          ¿Seguro que quieres eliminar a ${subject?.name}?
          \n Su historial se conservará.	
        `}
        confirmLabel="Eliminar"
        onConfirm={() => {
          removeSubject()
          setOpenConfirm(false)
        }}
      />


      {/* Modal nueva actividad */}
      <Dialog open={openActivity} onOpenChange={(val) => { setOpenActivity(val); if (!val) resetActivity() }}>
        <DialogContent
          style={{
            maxHeight: '90vh',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
          }}
          className="sm:p-[22px] md:p-3 sm:max-w-[425px] md:max-w-[500px]"
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

          <form onSubmit={handleSubmitActivity(onSubmitActivity)} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Título
              </label>
              <input
                {...registerActivity('title')}
                placeholder="Ej. Tarea 1, Examen parcial"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${activityErrors.title ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = activityErrors.title
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = activityErrors.title
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
              {activityErrors.title && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {activityErrors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Categoría
              </label>
              <Controller
                name="categoryId"
                control={controlActivity}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {subject?.gradeCategories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => field.onChange(cat.id)}
                        className="px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === cat.id
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === cat.id
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === cat.id ? 'white' : 'var(--color-text-secondary)',
                        }}
                      >
                        {cat.name} ({cat.percentage}%)
                      </button>
                    ))}
                  </div>
                )}
              />
              {activityErrors.categoryId && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {activityErrors.categoryId.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Valor máximo
                </label>
                <input
                  {...registerActivity('maxScore', { valueAsNumber: true })}
                  type="number"
                  min={1}
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
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Fecha de entrega
                </label>
                <input
                  {...registerActivity('dueDate')}
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

            <AppButton isPending={isCreatingActivity} pendingLabel="Creando..." fullWidth>
              Crear actividad
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!confirmActivityId}
        onOpenChange={open => { if (!open) setConfirmActivityId(null) }}
        title="Eliminar actividad"
        description="¿Seguro que deseas eliminar esta actividad? Se perderán todas las calificaciones asociadas en todos los grupos."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmActivityId) {
            deleteActivity(confirmActivityId)
            setConfirmActivityId(null)
          }
        }}
      />
    </ProtectedPage>
  )
}