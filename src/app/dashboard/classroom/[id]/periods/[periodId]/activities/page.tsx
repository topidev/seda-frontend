'use client'

import AppButton from "@/components/AppButton"
import AppInput from "@/components/AppInput"
import BackButton from "@/components/BackButton"
import ConfirmDialog from "@/components/ConfirmDialog"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { DialogContent, DialogHeader, Dialog, DialogTitle } from "@/components/ui/dialog"
import { useActivities, useClassDetail, useCreateActivity, useDeleteActivity } from "@/hooks/useClassroom"
import { Plus, Trash2, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function ActivitiesPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string
  const periodId = params.periodId as string

  const { data: cls } = useClassDetail(subjectTermGroupId)
  const { data: activities, isLoading } = useActivities(subjectTermGroupId, periodId)
  const { mutate: createActivity, isPending } = useCreateActivity(subjectTermGroupId, periodId)
  const { mutate: deleteActivity } = useDeleteActivity(subjectTermGroupId, periodId)

  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [maxScore, setMaxScore] = useState('10')
  const [dueDate, setDueDate] = useState('')

  const period = cls?.academicTerm.periods.find(p => p.id === periodId)
  const categories = cls?.subject.gradeCategories ?? []

  const handleSubmit = () => {
    if (!title.trim() || !categoryId) return

    createActivity(
      {
        title,
        description: description || undefined,
        categoryId,
        maxScore: Number(maxScore),
        dueDate: dueDate || undefined
      },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle('')
          setDescription('')
          setCategoryId('')
          setMaxScore('10')
          setDueDate('')
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
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          <Plus size={16} />
          <span className="hidden md:block">
            Nueva
          </span>
        </button>
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
                textTransform: 'none',
              }}
            >
              Nueva actividad
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <AppInput
              label="Título"
              value={title}
              onChange={setTitle}
              placeholder="Ej. Tarea 1, Examen parcial"
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
            />

            <AppInput
              label="Descripción (opcional)"
              value={description}
              onChange={setDescription}
              placeholder="Instrucciones o detalles"
            />

            {/* Categoría */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                    style={{
                      backgroundColor: categoryId === cat.id
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-tertiary)',
                      border: `1px solid ${categoryId === cat.id
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'}`,
                      color: categoryId === cat.id
                        ? 'white'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {cat.name} ({cat.percentage}%)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <AppInput
                  label="Valor máximo"
                  value={maxScore}
                  onChange={setMaxScore}
                  type="number"
                  min={1}
                />
              </div>
              <div className="flex-1">
                <AppInput
                  label="Fecha de entrega"
                  value={dueDate}
                  onChange={setDueDate}
                  type="date"
                />
              </div>
            </div>

            <AppButton
              onClick={handleSubmit}
              disabled={!title.trim() || !categoryId}
              isPending={isPending}
              pendingLabel="Creando..."
              fullWidth
            >
              Crear actividad
            </AppButton>
          </div>
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