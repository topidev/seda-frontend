'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import { useGroup, useAssignSubjectToGroup, useRemoveSubjectFromGroup, useRemoveStudentFromGroup, useDeleteGroup } from '@/hooks/useGroups'
import { useSubjects } from '@/hooks/useSubjects'
import { useCreateStudent, useStudents, useAssignStudentToGroup } from '@/hooks/useStudents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, BookOpen } from 'lucide-react'
import Spinner from '@/components/Spinner'
import AppButton from '@/components/AppButton'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import BackButton from '@/components/BackButton'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

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
  const router = useRouter()

  const { data: group, isLoading } = useGroup(groupId, academicTermId)
  const { data: subjects } = useSubjects()
  const { data: allStudents } = useStudents()

  const { mutate: assignSubject } = useAssignSubjectToGroup(groupId)
  const { mutate: createStudent, isPending: isCreatingStudent } = useCreateStudent(groupId, academicTermId)
  const { mutate: assignStudent } = useAssignStudentToGroup()
  const { mutate: removeSubject } = useRemoveSubjectFromGroup(groupId)
  const { mutate: removeStudent } = useRemoveStudentFromGroup(groupId)
  const { mutate: deleteGroup } = useDeleteGroup()

  const [openNewStudent, setOpenNewStudent] = useState(false)
  const [openAssignStudent, setOpenAssignStudent] = useState(false)
  const [openAssignSubject, setOpenAssignSubject] = useState(false)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false)

  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assigningSubjectId, setAssigningSubjectId] = useState<string | null>(null)
  const [confirmRemoveSubjectId, setConfirmRemoveSubjectId] = useState<string | null>(null)
  const [confirmRemoveStudentId, setConfirmRemoveStudentId] = useState<string | null>(null)

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
    setAssigningId(studentId)
    assignStudent(
      { studentId, groupId, academicTermId },
      {
        onSuccess: () => {
          setOpenAssignStudent(false)
          setAssigningId(null)
        },
        onError: () => {
          setAssigningId(null)
        }
      }
    )
  }

  const handleAssignSubject = (subjectId: string) => {
    setAssigningSubjectId(subjectId)
    assignSubject(
      { subjectId, academicTermId },
      {
        onSuccess: () => {
          setOpenAssignSubject(false)
          setAssigningSubjectId(null)
        },
        onError: () => {
          setAssigningSubjectId(null)
        }
      }
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
        <div className="flex-1">
          <h1
            className="text-xl md:text-2xl font-semibold"
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
        <button
          onClick={() => setConfirmDeleteGroup(true)}
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
                className="flex items-center gap-3 justify-between px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                {/* <BookOpen size={16} style={{ color: 'var(--color-primary)' }} /> */}
                {/* <Link 
                  href={`/dashboard/subjects/${stg.subjectId}`}
                > */}
                  <div className="flex items-center gap-3" onClick={() => (
                    console.log("stg.id: " + stg.id + " | stg.subject.id: " + stg.subject.id + " | stg.subjectid: " + stg.subjectId)                    
                  )}>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {stg.subject.name}
                    </span>
                  </div>
                {/* </Link> */}
                <button
                  onClick={() => setConfirmRemoveSubjectId(stg.id)}
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
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setConfirmRemoveStudentId(sgt.id)}
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
            ].map(({ field, label, placeholder }) => (
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
              availableStudents.map(student => {
                const isThisOne = assigningId === student.id
                const isDisabled = assigningId !== null

                return (
                  <button
                    key={student.id}
                    disabled={isDisabled}
                    onClick={() => handleAssignStudent(student.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                      opacity: isDisabled && !isThisOne ? 0.5 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!isDisabled) e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onMouseLeave={e => {
                      if (!isDisabled) e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--color-bg-primary)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {isThisOne ? (
                        <div
                          className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                          style={{ borderColor: 'var(--color-primary)' }}
                        />
                      ) : (
                        `${student.name[0]}${student.firstLastName[0]}`
                      )}
                    </div>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {student.name} {student.firstLastName} {student.secondLastName}
                    </span>
                  </button>
                )
              })
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
            {availableSubjects.map(subject => {
              const isThisOne = assigningSubjectId === subject.id
              const isDisabled = assigningSubjectId !== null
              return (
                <button
                  key={subject.id}
                  disabled={isDisabled}
                  onClick={() => handleAssignSubject(subject.id)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    opacity: isDisabled && !isThisOne ? 0.5 : 1,
                    border: '1px solid var(--color-border)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isDisabled) e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onMouseLeave={e => {
                    if (!isDisabled) e.currentTarget.style.borderColor = 'var(--color-border)'
                  }}
                >
                  {isThisOne ? (
                    <div
                      className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin flex-shrink-0"
                      style={{ borderColor: 'var(--color-primary)' }}
                    />
                  ) : (
                    <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
                  )}
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {subject.name}
                  </span>
                </button>
              )
            }
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmRemoveSubjectId}
        onOpenChange={open => { if (!open) setConfirmRemoveSubjectId(null) }}
        title="Quitar materia del grupo"
        description="¿Seguro que deseas quitar esta materia del grupo? Las actividades y calificaciones ya creadas se conservarán."
        confirmLabel="Quitar"
        onConfirm={() => {
          if (confirmRemoveSubjectId) {
            removeSubject(confirmRemoveSubjectId)
            setConfirmRemoveSubjectId(null)
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmRemoveStudentId}
        onOpenChange={open => { if (!open) setConfirmRemoveStudentId(null) }}
        title="Quitar alumno del grupo"
        description="¿Seguro que deseas quitar a este alumno del grupo? Su historial académico se conservará."
        confirmLabel="Quitar"
        onConfirm={() => {
          if (confirmRemoveStudentId) {
            removeStudent(confirmRemoveStudentId)
            setConfirmRemoveStudentId(null)
          }
        }}
      />

      <ConfirmDialog
        open={confirmDeleteGroup}
        onOpenChange={setConfirmDeleteGroup}
        title="Eliminar grupo"
        description={`¿Seguro que deseas eliminar ${group?.grade}° ${group?.letter}? Las materias y alumnos asignados se desvincularán, pero su información se conservará.`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          deleteGroup(groupId, {
            onSuccess: () => router.replace('/dashboard/groups'),
          })
          setConfirmDeleteGroup(false)
        }}
      />

    </ProtectedPage>
  )
}