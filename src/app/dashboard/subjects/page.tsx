'use client'

import { useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import { useSubjects, useCreateSubject } from '@/hooks/useSubjects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, Plus } from 'lucide-react'
import Link from 'next/link'

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects()
  const { mutate: createSubject, isPending, isError } = useCreateSubject()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    createSubject(
      { name },
      {
        onSuccess: () => {
          setOpen(false)
          setName('')
        },
      },
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Mis materias
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {subjects?.length ?? 0} materias registradas
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
          Nueva materia
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)' }}
          />
        </div>
      )}

      {/* Lista vacía */}
      {!isLoading && subjects?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <BookOpen
            size={48}
            style={{ color: 'var(--color-text-disabled)' }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Aún no tienes materias registradas
          </p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Crear primera materia
          </button>
        </div>
      )}

      {/* Lista de materias */}
      {!isLoading && subjects && subjects.length > 0 && (
        <div className="flex flex-col gap-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/dashboard/subjects/${subject.id}`}>
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
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <BookOpen
                      size={20}
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {subject.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {subject.gradeCategories.length} categorías ·{' '}
                      {subject._count.subjectTermGroups} grupos asignados
                    </p>
                  </div>
                </div>

                {/* Indicador de ponderación total */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color:
                        subject.gradeCategories.reduce(
                          (sum, c) => sum + c.percentage,
                          0,
                        ) === 100
                          ? 'var(--color-success)'
                          : 'var(--color-warning)',
                    }}
                  >
                    {subject.gradeCategories.reduce(
                      (sum, c) => sum + c.percentage,
                      0,
                    )}
                    %
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-disabled)' }}
                  >
                    ponderación
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal nueva materia */}
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
              Nueva materia
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Nombre de la materia
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Física, Matemáticas, Historia"
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
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
            </div>

            {isError && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                Ocurrió un error al crear la materia. Intenta de nuevo.
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              className="w-full py-3 rounded-xl font-medium transition-colors"
              style={{
                backgroundColor:
                  isPending || !name.trim()
                    ? 'var(--color-text-disabled)'
                    : 'var(--color-primary)',
                color: 'white',
                cursor:
                  isPending || !name.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Guardando...' : 'Guardar materia'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}