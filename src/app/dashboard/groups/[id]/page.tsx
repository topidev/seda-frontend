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
import { ArrowLeft, Plus, BookOpen, UserSquare } from 'lucide-react'
import Link from 'next/link'

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
  const [name, setName] = useState('')
  const [firstLastName, setFirstLastName] = useState('')
  const [secondLastName, setSecondLastName] = useState('')

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

  const handleCreateStudent = () => {
    if (!name.trim() || !firstLastName.trim()) return

    createStudent(
      { name, firstLastName, secondLastName, groupId, academicTermId },
      {
        onSuccess: () => {
          setOpenNewStudent(false)
          setName('')
          setFirstLastName('')
          setSecondLastName('')
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
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)' }}
          />
        </div>
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/groups">
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <ArrowLeft size={16} />
          </button>
        </Link>
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
                <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
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
          <div className="flex gap-2">
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
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
      <Dialog open={openNewStudent} onOpenChange={setOpenNewStudent}>
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

          <div className="flex flex-col gap-4 mt-2">
            {[
              { label: 'Nombre', value: name, setter: setName, placeholder: 'Ej. Juan' },
              { label: 'Apellido paterno', value: firstLastName, setter: setFirstLastName, placeholder: 'Ej. Pérez' },
              { label: 'Apellido materno', value: secondLastName, setter: setSecondLastName, placeholder: 'Ej. García (opcional)' },
            ].map(field => (
              <div key={field.label} className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {field.label}
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
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
            ))}

            <button
              onClick={handleCreateStudent}
              disabled={isCreatingStudent || !name.trim() || !firstLastName.trim()}
              className="w-full py-3 rounded-xl font-medium transition-colors mt-2"
              style={{
                backgroundColor:
                  isCreatingStudent || !name.trim() || !firstLastName.trim()
                    ? 'var(--color-text-disabled)'
                    : 'var(--color-primary)',
                color: 'white',
                cursor:
                  isCreatingStudent || !name.trim() || !firstLastName.trim()
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {isCreatingStudent ? 'Guardando...' : 'Guardar alumno'}
            </button>
          </div>
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