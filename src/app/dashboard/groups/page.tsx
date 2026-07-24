'use client'

import { useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import { useSchools } from '@/hooks/useSchools'
import { useGroups, useCreateGroup } from '@/hooks/useGroups'
import { useSubjects } from '@/hooks/useSubjects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'
import Spinner from '@/components/Spinner'
import AppButton from '@/components/AppButton'
import { usePreferencesStore } from '@/store/preferences.store'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePageTitle } from '@/hooks/usePageTitle'

const grades = ['1', '2', '3']
const letters = ['A', 'B', 'C', 'D', 'E']

const createGroupSchema = z.object({
  grade: z.enum(['1','2','3'], { message: 'Selecciona un grado'}),
  letter: z.enum(['A','B','C','D','E'], { message: 'Selecciona un grupo'}),
  subjectIds: z.array(z.string()).optional()
})

type CreateGroupFormData = z.infer<typeof createGroupSchema>

export default function GroupsPage() {
  usePageTitle('Grupos')
  const { data: schools } = useSchools()
  const { data: subjects } = useSubjects()

  const selectedSchoolId = usePreferencesStore(s => s.selectedSchoolId)
  const setSelectedSchool = usePreferencesStore(s => s.setSelectedSchool)
  const selectedTermId = usePreferencesStore(s => s.selectedTermId)
  const setSelectedTerm = usePreferencesStore(s => s.setSelectedTerm)

  const selectedSchool = schools?.find(s => s.id === selectedSchoolId)
  const [open, setOpen] = useState(false)

  const { data: groups, isLoading } = useGroups(selectedSchoolId, selectedTermId)
  const { mutate: createGroup, isPending, isError } = useCreateGroup()

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      grade: '1',
      letter: 'A',
      subjectIds: []
    }
  })

  const onSubmit = (data: CreateGroupFormData) => {
    if (!selectedSchoolId || !selectedTermId) return

    createGroup(
      {
        schoolId: selectedSchoolId,
        grade: data.grade,
        letter: data.letter,
        academicTermId: selectedTermId,
        subjectIds: data.subjectIds,
      },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId)
    setSelectedTerm('')
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className='text-center md:text-left'>
          <h1
            className="text-xl md:text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            Grupos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona una escuela y ciclo para ver sus grupos
          </p>
        </div>

        {selectedSchoolId && selectedTermId && (
          <button
            onClick={() => setOpen(true)}
            className="flex mt-2 md:mt-auto items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }}
          >
            <Plus size={16} />
            Nuevo grupo
          </button>
        )}
      </div>

      {/* Selectores */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        {/* Selector escuela */}
        <select
          value={selectedSchoolId}
          onChange={e => handleSchoolChange(e.target.value)}
          className="flex-1 w-full px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: selectedSchoolId
              ? 'var(--color-text-primary)'
              : 'var(--color-text-disabled)',
          }}
        >
          <option value="">Selecciona una escuela</option>
          {schools?.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>

        {/* Selector ciclo */}
        <select
          value={selectedTermId}
          onChange={e => setSelectedTerm(e.target.value)}
          disabled={!selectedSchoolId}
          className="flex-1 px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: selectedTermId
              ? 'var(--color-text-primary)'
              : 'var(--color-text-disabled)',
            opacity: !selectedSchoolId ? 0.5 : 1,
          }}
        >
          <option value="">Selecciona un ciclo</option>
          {selectedSchool?.academicTerms?.map(term => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && selectedSchoolId && selectedTermId && (
        <Spinner />
      )}

      {/* Sin selección */}
      {!selectedSchoolId && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Users size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona una escuela para ver sus grupos
          </p>
        </div>
      )}

      {/* Lista vacía */}
      {!isLoading && selectedSchoolId && selectedTermId && groups?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Users size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No hay grupos en este ciclo
          </p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Crear primer grupo
          </button>
        </div>
      )}

      {/* Lista de grupos */}
      {!isLoading && groups && groups.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}?academicTermId=${selectedTermId}`}
            >
              <div
                className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-colors"
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
                <div
                  className="rounded-xl flex items-center justify-start"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <span
                    className="text-lg font-semibold"
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-geist)',
                    }}
                  >
                    {group.grade}°{group.letter}
                  </span>
                </div>
                <div>
                  {/* <p
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {group.grade}° {group.letter}
                  </p> */}
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {group.studentGroupTerms?.length ?? 0} alumnos
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    {group.subjectTermGroups.length} materias
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal nuevo grupo */}
      <Dialog 
        open={open} 
        onOpenChange={
          (val) => {
            setOpen(val)
            if (!val) reset()
          }
        }
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
              Nuevo grupo
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
            {/* Grado */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Grado
              </label>
              <Controller
                name='grade'
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {grades.map(g => (
                      <button
                        key={g}
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          field.onChange(g)
                        }}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === g
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === g
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === g ? 'white' : 'var(--color-text-secondary)',
                        }}
                      >
                        {g}°
                      </button>
                    ))}
                  </div>
                )} 
              />
              {errors.grade && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.grade.message}
                </p>
              )}
            </div>
            {/* Letra */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Grupo
              </label>
              <Controller
                name='letter'
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {letters.map(l => (
                      <button
                        key={l}
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          field.onChange(l)
                        }}
                        className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          backgroundColor: field.value === l
                            ? 'var(--color-primary)'
                            : 'var(--color-bg-tertiary)',
                          border: `1px solid ${field.value === l
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                          color: field.value === l ? 'white' : 'var(--color-text-secondary)',
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.letter && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.letter.message}
                </p>
              )}
            </div>

            {/* Materias */}
            {subjects && subjects.length > 0 && (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Materias a impartir (opcional)
                </label>
                <Controller
                  name='subjectIds'
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2">
                      {subjects.map(subject => {
                        const isSelected = field.value?.includes(subject.id) ?? false
                        return (
                          <button
                            type="button" 
                            key={subject.id}
                            onClick={(e) => {
                              e.preventDefault();
                              const current = field.value ?? []
                              field.onChange(
                                isSelected 
                                  ? current.filter(id => id !== subject.id)
                                  : [...current, subject.id]
                              )
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer"
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(37, 99, 235, 0.1)'
                                : 'var(--color-bg-tertiary)',
                              border: `1px solid ${isSelected
                                ? 'var(--color-primary)'
                                : 'var(--color-border)'}`,
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isSelected
                                  ? 'var(--color-primary)'
                                  : 'transparent',
                                border: `1.5px solid ${isSelected
                                  ? 'var(--color-primary)'
                                  : 'var(--color-border)'}`,
                              }}
                            >
                              {isSelected && (
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
                            <span style={{ color: 'var(--color-text-primary)' }}>
                              {subject.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  />
              </div>
            )}

            {isError && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                Ocurrió un error al crear el grupo. Intenta de nuevo.
              </p>
            )}

            <AppButton
              fullWidth
              type="submit"
              isPending={isPending}
              pendingLabel='Creando...'
            >
              Crear grupo
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}