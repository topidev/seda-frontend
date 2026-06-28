'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import { useGroup, useAssignSubjectToGroup } from '@/hooks/useGroups'
import { useSubjects } from '@/hooks/useSubjects'
import { useCreateStudent, useStudents, useAssignStudentToGroup } from '@/hooks/useStudents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import Spinner from '@/components/Spinner'
import AppInput from '@/components/AppInput'
import AppButton from '@/components/AppButton'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import BackButton from '@/components/BackButton'

const newStudentSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  firstLastName: z.string().min(2, 'Mínimo 2 caracteres'),
  secondLastName: z.string().optional()
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

export default function GroupDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const groupId = params.id as string
  const academicTermId = searchParams.get('academicTermId') ?? ''

  const { data: group, isLoading } = useGroup(groupId, academicTermId)
  const { data: subjects } = useSubjects()
  const { data: allStudents } = useStudents()

  const { mutate: assignSubject } = useAssignSubjectToGroup(groupId)
  const { mutate: createStudent, isPending: isCreatingStudent } = useCreateStudent(groupId, academicTermId)
  const { mutate: assignStudent } = useAssignStudentToGroup()

  const [openNewStudent, setOpenNewStudent] = useState(false)
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [openAssignSubject, setOpenAssignSubject] = useState(false)

  // Formulario nuevo alumno
  // const [name, setName] = useState('')
  // const [firstLastName, setFirstLastName] = useState('')
  // const [secondLastName, setSecondLastName] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      name: '',
      firstLastName: '',
      secondLastName: ''
    }
  })

  // Alumnos que ya están en el grupo
  const studentIdsInGroup = group?.studentGroupTerms.map(s => s.studentId) ?? []

  // Alumnos disponibles para asignar (no están en el grupo)
  const availableStudents = allStudents?.filter(
    s => !studentIdsInGroup.includes(s.id) && !s.deletedAt,
  ) ?? []

  // Materias que ya están en el grupo
  const subjectIdsInGroup = group?.subjectTermGroups.map(s => s.subjectId) ?? []

  // Materias disponibles para asignar
  const availableSubjects = subjects?.filter(
    s => !subjectIdsInGroup.includes(s.id),
  ) ?? []

  const onSubmitNewStudent = (data: NewStudentFormData) => {
    createStudent(
      { ...data, groupId, academicTermId },
      {
        onSuccess: () => {
          setOpenNewStudent(false)
          reset()
        },
      },
    )
  }

  const handleAssignStudent = (studentId: string) => {
    assignStudent(
      { studentId, groupId, academicTermId },
      { onSuccess: () => setOpenAssignStudent(false) },
    )
  }

  const handleAssignSubject = (subjectId: string) => {
    assignSubject(
      { subjectId, academicTermId },
      { onSuccess: () => setOpenAssignSubject(false) },
    )
  }

  if (isLoading) {
    return (
      <ProtectedPage>
        <Spinner fullScreen />
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BackButton href='/dashboard/groups' />
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {group?.grade}° {group?.letter}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {group?.studentGroupTerms.length ?? 0} alumnos ·{' '}
            {group?.subjectTermGroups.length ?? 0} materias
          </p>
        </div>
      </div>

      {/* Sección materias */}
      <div
        className="rounded-2xl p-6 mb-4"
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
            Materias
          </h2>
          {availableSubjects.length > 0 && (
            <button
              onClick={() => setOpenAssignSubject(true)}
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
              Asignar materia
            </button>
          )}
        </div>

        {group?.subjectTermGroups.length === 0 ? (
          <p
            className="text-sm py-4 text-center"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            No hay materias asignadas a este grupo
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {group?.subjectTermGroups.map(stg => (
              <div
                key={stg.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                {/* <BookOpen size={16} style={{ color: 'var(--color-primary)' }} /> */}
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {stg.subject.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección alumnos */}
      <div
        className="rounded-2xl p-6"
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
            Alumnos
          </h2>
          <div className="flex flex-col md:flex-row gap-2">
            {availableStudents.length > 0 && (
              <button
                onClick={() => setOpenAssignStudent(true)}
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
                Alumno existente
              </button>
            )}
            <button
              onClick={() => setOpenNewStudent(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
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
              <Plus size={14} />
              Nuevo alumno
            </button>
          </div>
        </div>

        {group?.studentGroupTerms.length === 0 ? (
          <p
            className="text-sm py-4 text-center"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            No hay alumnos en este grupo
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {group?.studentGroupTerms.map(sgt => (
              <div
                key={sgt.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {sgt.student.name[0]}{sgt.student.firstLastName[0]}
                </div>
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {sgt.student.name} {sgt.student.firstLastName}{' '}
                  {sgt.student.secondLastName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nuevo alumno */}
      <Dialog 
        open={openNewStudent} 
        onOpenChange={(val) => {
          setOpenNewStudent(val)
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
              }}
            >
              Nuevo alumno
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitNewStudent)} className="flex flex-col gap-4 mt-2">
            {[
              { field: 'name' as const, label: 'Nombre', placeholder: 'Ej. Juan' },
              { field: 'firstLastName' as const, label: 'Apellido Paterno', placeholder: 'Ej. Pérez' },
              { field: 'secondLastName' as const, label: 'Apellido Mater', placeholder: 'Ej. García (Opcional)' },
            ].map(({field, label, placeholder}) => (
              <div key={field} className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {label}
                </label>
                <input
                  {...register(field)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: `1px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = errors[field]
                      ? 'var(--color-error)'
                      : 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors[field]
                      ? 'var(--color-error)'
                      : 'var(--color-border)'
                  }}
                />
                {errors[field] && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            ))}

            <AppButton
              fullWidth
              pendingLabel="Guardando..."
              isPending={isCreatingStudent}
            >
              Guardar alumno
            </AppButton>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal asignar alumno existente */}
      <Dialog open={openAssignStudent} onOpenChange={setOpenAssignStudent}>
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
              Asignar alumno existente
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-2 max-h-64 overflow-y-auto">
            {availableStudents.length === 0 ? (
              <p
                className="text-sm text-center py-4"
                style={{ color: 'var(--color-text-disabled)' }}
              >
                No hay alumnos disponibles para asignar
              </p>
            ) : (
              availableStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleAssignStudent(student.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
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
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--color-bg-primary)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {student.name[0]}{student.firstLastName[0]}
                  </div>
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {student.name} {student.firstLastName} {student.secondLastName}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal asignar materia */}
      <Dialog open={openAssignSubject} onOpenChange={setOpenAssignSubject}>
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
              Asignar materia
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-2">
            {availableSubjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => handleAssignSubject(subject.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}