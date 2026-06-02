'use client'

import { useState } from 'react'
import { useRequiredAuth } from '@/hooks/useAuthGuard'
import { useSchools, useCreateSchool, shiftLabel } from '@/hooks/useSchools'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GraduationCap, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import ProtectedPage from '@/components/ProtectedPage'
import Spinner from '@/components/Spinner'
import AppInput from '@/components/AppInput'
import AppButton from '@/components/AppButton'

const shifts = [
  { value: 'MORNING', label: 'Matutino' },
  { value: 'AFTERNOON', label: 'Vespertino' },
  { value: 'EVENING', label: 'Nocturno' },
]

export default function SchoolsPage() {
  const { data: schools, isLoading } = useSchools()
  const { mutate: createSchool, isPending, isError } = useCreateSchool()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [shift, setShift] = useState<'MORNING' | 'AFTERNOON' | 'EVENING'>('MORNING')

  const handleSubmit = () => {
    if (!name.trim()) return

    createSchool(
      { name, shift, level: 'SECONDARY' },
      {
        onSuccess: () => {
          setOpen(false)
          setName('')
          setShift('MORNING')
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
            Mis escuelas
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {schools?.length ?? 0} escuelas registradas
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary)'
          }}
        >
          <Plus size={16} />
          Nueva escuela
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <Spinner fullScreen />
      )}

      {/* Lista vacía */}
      {!isLoading && schools?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <GraduationCap
            size={48}
            style={{ color: 'var(--color-text-disabled)' }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Aún no tienes escuelas registradas
          </p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
            }}
          >
            Registrar primera escuela
          </button>
        </div>
      )}

      {/* Lista de escuelas */}
      {!isLoading && schools && schools.length > 0 && (
        <div className="flex flex-col gap-3">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/dashboard/schools/${school.id}`}
            >
              <div
                className="rounded-2xl p-5 flex items-center justify-between transition-colors cursor-pointer"
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
                    <GraduationCap
                      size={20}
                      style={{ color: 'var(--color-primary)' }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {school.name}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {shiftLabel[school.shift]}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-1 text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <Users size={14} />
                  {school._count.groups} grupos
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal nueva escuela */}
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
              Nueva escuela
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Nombre de la escuela
              </label>
              <AppInput
                type="text"
                value={name}
                onChange={setName}
                placeholder="Ej. Secundaria Benito Juárez"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
            </div>

            {/* Turno */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Turno
              </label>
              <div className="flex gap-2">
                {shifts.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setShift(s.value as typeof shift)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: shift === s.value
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-tertiary)',
                      border: `1px solid ${shift === s.value
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'}`,
                      color: shift === s.value
                        ? 'white'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {isError && (
              <p
                className="text-sm"
                style={{ color: 'var(--color-error)' }}
              >
                Ocurrió un error al crear la escuela. Intenta de nuevo.
              </p>
            )}

            {/* Botón submit */}
            <AppButton
              onClick={handleSubmit}
              disabled={isPending || !name.trim()}
              isPending={isPending}
              pendingLabel='Guardando'
            >
              Guardar escuela
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}