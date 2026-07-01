'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { ArrowLeft, BookOpen, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ConfirmDialog from '@/components/ConfirmDialog'
import { toast } from 'sonner'
import BackButton from '@/components/BackButton'

interface StudentDetail {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
  birthDate: string | null
  tutorName: string | null
  tutorPhone: string | null
  deletedAt: string | null
  groupTerms: {
    id: string
    groupId: string
    academicTermId: string
    group: {
      id: string
      grade: string
      letter: string
      subjectTermGroups: {
        id: string
        subject: { id: string; name: string }
      }[]
    }
  }[]
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const studentId = params.id as string

  const [openEdit, setOpenEdit] = useState(false)
  const [name, setName] = useState('')
  const [firstLastName, setFirstLastName] = useState('')
  const [secondLastName, setSecondLastName] = useState('')
  const [tutorName, setTutorName] = useState('')
  const [tutorPhone, setTutorPhone] = useState('')

  // abrir el modal de confirmación
  const [openConfirm, setOpenConfirm] = useState(false)

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      const { data } = await api.get<StudentDetail>(`/students/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })

  const { mutate: updateStudent, isPending: isUpdating } = useMutation({
    mutationFn: async (dto: Partial<StudentDetail>) => {
      const { data } = await api.patch(`/students/${studentId}`, dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      setOpenEdit(false)
    },
  })

  const { mutate: removeStudent } = useMutation({
    mutationFn: async () => {
      await api.delete(`/students/${studentId}`)
    },
    onSuccess: () => {
      toast.success('Alumno Inactivado')
      queryClient.invalidateQueries({ queryKey: ['students'] })
      router.replace('/dashboard/students')
    },
    onError: () => {
      toast.error('Error al inactivar el alumno')
    }
  })

  const handleOpenEdit = () => {
    if (!student) return
    setName(student.name)
    setFirstLastName(student.firstLastName)
    setSecondLastName(student.secondLastName ?? '')
    setTutorName(student.tutorName ?? '')
    setTutorPhone(student.tutorPhone ?? '')
    setOpenEdit(true)
  }

  const handleUpdate = () => {
    updateStudent({ name, firstLastName, secondLastName, tutorName, tutorPhone })
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  // Obtiene todas las materias únicas del alumno a través de sus grupos
  const subjects = student?.groupTerms.flatMap(gt =>
    gt.group.subjectTermGroups.map(stg => ({
      subjectId: stg.subject.id,
      subjectTermGroupId: stg.id,
      name: stg.subject.name,
      academicTermId: gt.academicTermId
    }))
  ) ?? []

  const uniqueSubjects = subjects.filter(
    (s, i, arr) => arr.findIndex(x => x.subjectId === s.subjectId) === i,
  )

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
        <BackButton href='/dashboard/students' />
        <div className="flex-1">
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {student?.name} {student?.firstLastName} {student?.secondLastName}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {student?.groupTerms.map(gt =>
              `${gt.group.grade}°${gt.group.letter}`
            ).join(', ') || 'Sin grupo asignado'}
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={handleOpenEdit}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
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
            <Pencil size={15} />
          </button>
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

      {/* Info básica */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2
          className="text-base font-medium mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Información
        </h2>
        <div className="flex flex-col gap-3">
          {[
            {
              label: 'Fecha de nacimiento',
              value: student?.birthDate
                ? formatDate(student.birthDate)
                : 'No registrada',
            },
            {
              label: 'Tutor',
              value: student?.tutorName || 'No registrado',
            },
            {
              label: 'Teléfono del tutor',
              value: student?.tutorPhone || 'No registrado',
            },
          ].map(item => (
            <div key={item.label} className="flex justify-between">
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {item.label}
              </span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Materias */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2
          className="text-base font-medium mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Materias
        </h2>

        {uniqueSubjects.length === 0 ? (
          <p
            className="text-sm text-center py-4"
            style={{ color: 'var(--color-text-disabled)' }}
          >
            Sin materias asignadas
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {uniqueSubjects.map(subject => (
              <Link
                key={subject.subjectTermGroupId}
                href={`/dashboard/students/${studentId}/subjects/${subject.subjectTermGroupId}?academicTermId=${subject.academicTermId}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen
                      size={16}
                      style={{ color: 'var(--color-primary)' }}
                    />
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {subject.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
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
              Editar alumno
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {[
              { label: 'Nombre', value: name, setter: setName },
              { label: 'Apellido paterno', value: firstLastName, setter: setFirstLastName },
              { label: 'Apellido materno', value: secondLastName, setter: setSecondLastName },
              { label: 'Nombre del tutor', value: tutorName, setter: setTutorName },
              { label: 'Teléfono del tutor', value: tutorPhone, setter: setTutorPhone },
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
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full py-3 rounded-xl font-medium transition-colors mt-2"
              style={{
                backgroundColor: isUpdating
                  ? 'var(--color-text-disabled)'
                  : 'var(--color-primary)',
                color: 'white',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
              }}
            >
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title='Inactivar alumno'
        description={`¿Seguro que quieres inactivar a ${student?.name} ${student?.firstLastName}?\n Su historial se conservará.`}
        confirmLabel='Inactivar'
        onConfirm={() => {
          removeStudent()
          setOpenConfirm(false)
        }}
      />
    </ProtectedPage>
  )
}