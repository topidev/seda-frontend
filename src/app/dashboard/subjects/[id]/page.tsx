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
import AppInput from '@/components/AppInput'
import AppButton from '@/components/AppButton'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
// import { queryClient } from '@/lib/query-client'
import ConfirmDialog from '@/components/ConfirmDialog'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string
  const queryClient = useQueryClient()

  const { data: subject, isLoading } = useSubject(subjectId)
  const { mutate: createCategory, isPending, isError } = useCreateGradeCategory(subjectId)
  const { mutate: deleteCategory } = useDeleteGradeCategory(subjectId)

  const [open, setOpen] = useState(false)
  // const [categoryName, setCategoryName] = useState('')
  // const [percentage, setPercentage] = useState('')

  const [openConfirm, setOpenConfirm] = useState(false)
  
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
                className="text-2xl font-semibold"
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

      {/* Modal nueva categoría */}
      <Dialog open={open} onOpenChange={setOpen}>
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
                {...register('percentage'), {
                  valueAsNumber: true,
                  min: 5,
                  max: availablePercentage
                }}
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
    </ProtectedPage>
  )
}