'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProtectedPage from '@/components/ProtectedPage'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { ArrowLeft, BookOpen, FileWarning, Pencil, Trash2 } from 'lucide-react'
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
import ReportDialog from '@/components/ReportDialog'
import { useDeleteReport, useStudentReports } from '@/hooks/useReports'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AppButton from '@/components/AppButton'
import { useRemoveStudent, useUpdateStudent } from '@/hooks/useStudents'
import { useSchool, useSchools } from '@/hooks/useSchools'
import Spinner from '@/components/Spinner'

interface StudentDetail {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
  curp: string | null
  birthDate: string | null
  tutorName: string | null
  tutorPhone: string | null
  tutorEmail: string | null
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

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  firstLastName: z.string().min(2, 'Mínimo 2 caracteres'),
  secondLastName: z.string().optional(),
  curp: z.string()
    .regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/, 'CURP inválida')
    .optional()
    .or(z.literal('')),
  birthDate: z.string().optional(),
  tutorName: z.string().optional(),
  tutorPhone: z.string().optional(),
  tutorEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})

type UpdateStudentFormData = z.infer<typeof editSchema>

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string

  const [openEdit, setOpenEdit] = useState(false)
  const [expandedInfo, setExpandedInfo] = useState(false)

  const [selectedStgId, setSelectedStgId] = useState<string>('')
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')

  // abrir el modal de confirmación
  const [openConfirm, setOpenConfirm] = useState(false)
  const [openReport, setOpenReport] = useState(false)
  const [confirmDeleteReportId, setConfirmDeleteReportId] = useState<string | null>(null)

  const { data: student, isLoading } = useQuery({
    queryKey: ['students', studentId],
    queryFn: async () => {
      const { data } = await api.get<StudentDetail>(`/students/${studentId}`)
      return data
    },
    enabled: !!studentId,
  })

  const { data: schools } = useSchools()

  const { data: reports } = useStudentReports(studentId)

  const { mutate: updateStudent, isPending: isUpdating } = useUpdateStudent(studentId)

  const { mutate: removeStudent } = useRemoveStudent(studentId)

  const { mutate: deleteReport } = useDeleteReport(studentId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UpdateStudentFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      firstLastName: '',
      secondLastName: '',
      curp: '',
      birthDate: '',
      tutorName: '',
      tutorPhone: '',
      tutorEmail: '',
    }
  })

  const handleOpenEdit = () => {
    reset({
      name: student?.name ?? '',
      firstLastName: student?.firstLastName ?? '',
      secondLastName: student?.secondLastName ?? '',
      curp: student?.curp ?? '',
      birthDate: student?.birthDate
        ? new Date(student.birthDate).toISOString().split('T')[0]
        : '',
      tutorName: student?.tutorName ?? '',
      tutorPhone: student?.tutorPhone ?? '',
      tutorEmail: student?.tutorEmail ?? '',
    })
    setOpenEdit(true)
  }

  const handleUpdate = (data: UpdateStudentFormData) => {
    updateStudent(
      {
        name: data.name,
        firstLastName: data.firstLastName,
        secondLastName: data.secondLastName || undefined,
        curp: data.curp || undefined,
        birthDate: data.birthDate || undefined,
        tutorName: data.tutorName || undefined,
        tutorPhone: data.tutorPhone || undefined,
        tutorEmail: data.tutorEmail || undefined,
      },
      {
        onSuccess: () => {
          setOpenEdit(false)
          reset()
        }
      }
    )
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  // Obtiene todas las materias únicas del alumno a través de sus grupos
  const subjects = student?.groupTerms.flatMap(gt => {
    const periods = schools?.flatMap(s => s.academicTerms).find(t => t.id === gt.academicTermId)?.periods ?? []
    return gt.group.subjectTermGroups.map(stg => ({
      subjectId: stg.subject.id,
      subjectTermGroupId: stg.id,
      name: stg.subject.name,
      academicTermId: gt.academicTermId,
      periods
    }))
  }
  ) ?? []

  const selectedSubject = subjects.find(s => s.subjectTermGroupId === selectedStgId)
  const activePeriodId = selectedPeriodId || selectedSubject?.periods[0]?.id

  const { data: attendanceSummary, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['attendance-history', studentId, selectedStgId, activePeriodId],
    queryFn: async () => {
      const { data } = await api.get(
        `/students/${studentId}/subjects/${selectedStgId}/summary`,
        { params: { periodId: activePeriodId } },
      )
      return data
    },
    enabled: !!selectedStgId && !!activePeriodId,
  })

  const seeMore = (student?.curp || student?.birthDate || student?.tutorName || student?.tutorPhone || student?.tutorEmail)

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
            className="text-xl md:text-2xl font-semibold"
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
            onClick={() => setOpenReport(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-warning)'
              e.currentTarget.style.color = 'var(--color-warning)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            <FileWarning size={15} />
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
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Información
          </h2>
          <button
            onClick={() => setExpandedInfo(!expandedInfo)}
            className="text-sm cursor-pointer transition-colors"
            style={{ color: 'var(--color-primary)' }}
            hidden={seeMore ? false : true}
          >
            {expandedInfo ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {/* Siempre visible */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Tutor
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {student?.tutorName ?? 'No asignado'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              Teléfono
            </span>
            <a
              href={`tel:${student?.tutorPhone}`}
              className={`text-sm ${!student?.tutorPhone ? 'pointer-events-none' : 'cursor-pointer'}`}
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {student?.tutorPhone ?? 'No asignado'}
            </a>
          </div>
          {seeMore && (
            <>
              {/* Expandible */}
              {expandedInfo && (
                <>
                  {student?.tutorEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        Email tutor
                      </span>
                      <a
                        href={`mailto:${student.tutorEmail}`}
                        className="text-sm"
                        style={{ color: 'var(--color-secondary)' }}
                      >
                        {student.tutorEmail}
                      </a>
                    </div>
                  )}
                  {student?.birthDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        Nacimiento
                      </span>
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(student.birthDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {student?.curp && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        CURP
                      </span>
                      <span
                        className="text-sm font-mono"
                        style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}
                      >
                        {student.curp}
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Materias */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className='flex justify-between gap-2 items-center mb-3'>
          <h2
            className="text-base font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Materias
          </h2>
          <BookOpen
            size={16}
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-bg-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-bg-tertiary)'
                }}
              >
                <div
                  className="w-full flex items-center justify-between rounded-xl cursor-pointer"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <div className="flex items-center gap-3">
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

      {/* Reportes */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className='flex justify-between gap-2 items-center mb-3'>
          <h2
            className="text-base font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Reportes ({reports?.length ?? 0})
          </h2>
          <FileWarning
            size={16}
            className="shrink-0 mt-0.5"
            style={{ color: 'var(--color-warning)' }}
          />
        </div>

        {!reports || reports.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-disabled)' }}>
            Sin reportes registrados
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map(report => (
              <div
                key={report.id}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {report.reason}
                      </p>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          {new Date(report.date).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        {report.subjectTermGroup && (
                          <>
                            <span className='hidden md:visible' style={{ color: 'var(--color-text-disabled)' }}>·</span>
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-text-disabled)' }}
                            >
                              {report.subjectTermGroup.subject.name}
                            </span>
                          </>
                        )}
                        {report.notifyTutor && (
                          <>
                            <span className='hidden md:visible' style={{ color: 'var(--color-text-disabled)' }}>·</span>
                            <span
                              className="text-xs"
                              style={{ color: 'var(--color-info)' }}
                            >
                              Tutor notificado
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmDeleteReportId(report.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0"
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
        )}
      </div>

      {/* Historial de asistencias */}
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
          Historial de asistencias
        </h2>

        {/* Selector de materia */}
        <select
          value={selectedStgId}
          onChange={e => {
            setSelectedStgId(e.target.value)
            setSelectedPeriodId('')
          }}
          className="w-full px-4 py-3 rounded-xl outline-none text-sm mb-3 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            color: selectedStgId ? 'var(--color-text-primary)' : 'var(--color-text-disabled)',
          }}
        >
          <option value="">Selecciona una materia</option>
          {subjects.map(subject => (
            <option key={subject.subjectTermGroupId} value={subject.subjectTermGroupId}>
              {subject.name}
            </option>
          ))}
        </select>

        {/* Selector de bimestre */}
        {selectedStgId && selectedSubject && (
          <div className="flex gap-2 mb-4">
            {selectedSubject.periods.map(period => (
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

        {/* Lista de asistencias */}
        {isLoadingAttendance && <Spinner />}

        {!isLoadingAttendance && selectedStgId && attendanceSummary && (
          attendanceSummary.attendance.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-disabled)' }}>
              Sin registros de asistencia en este bimestre
            </p>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--color-border)' }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-8 px-3 py-2 text-xs font-medium uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-disabled)',
                }}
              >
                <span className="col-span-4">Fecha</span>
                <span className="col-span-1 text-center">P</span>
                <span className="col-span-1 text-center">A</span>
                <span className="col-span-1 text-center">T</span>
                <span className="col-span-1 text-center">J</span>
              </div>

              {/* Filas */}
              {attendanceSummary.attendance.map((entry: any, index: number) => {
                const isLast = index === attendanceSummary.attendance.length - 1
                const statusColors: Record<string, string> = {
                  PRESENT: 'var(--color-success)',
                  ABSENT: 'var(--color-error)',
                  LATE: 'var(--color-warning)',
                  EXCUSED: 'var(--color-info)',
                }

                return (
                  <div
                    key={entry.date}
                    className="grid grid-cols-8 items-center px-3 py-2.5"
                    style={{
                      backgroundColor: index % 2 === 0
                        ? 'var(--color-bg-elevated)'
                        : 'var(--color-bg-secondary)',
                      borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
                    }}
                  >
                    <span
                      className="col-span-4 text-sm"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {new Date(entry.date).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
                      <div key={status} className="col-span-1 flex justify-center">
                        {entry.status === status ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: statusColors[status] }}
                          >
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path
                                d="M1 4L3.5 6.5L9 1"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className="w-5 h-5 rounded-full"
                            style={{ border: '1.5px solid var(--color-border)' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        )}

        {!selectedStgId && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-disabled)' }}>
            Selecciona una materia para ver el historial
          </p>
        )}
      </div>




      {/* Modal editar */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
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
              Editar alumno
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleUpdate)} className="flex flex-col gap-4 mt-2">
            {/* Nombre y apellidos */}
            {[
              { field: 'name' as const, label: 'Nombre', placeholder: 'Ej. Juan' },
              { field: 'firstLastName' as const, label: 'Apellido paterno', placeholder: 'Ej. Pérez' },
              { field: 'secondLastName' as const, label: 'Apellido materno', placeholder: 'Ej. García (opcional)' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
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
                    e.currentTarget.style.borderColor = errors[field] ? 'var(--color-error)' : 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = errors[field] ? 'var(--color-error)' : 'var(--color-border)'
                  }}
                />
                {errors[field] && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Separador */}
            <div
              className="pt-2 mt-1"
              style={{ borderTop: '1px solid var(--color-divider)' }}
            >
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-disabled)' }}>
                Datos opcionales
              </p>

              <div className="flex flex-col gap-4">
                {/* CURP */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    CURP
                  </label>
                  <input
                    {...register('curp')}
                    placeholder="Ej. PEGJ850101HDFRZN09"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors uppercase"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: `1px solid ${errors.curp ? 'var(--color-error)' : 'var(--color-border)'}`,
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = errors.curp ? 'var(--color-error)' : 'var(--color-primary)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = errors.curp ? 'var(--color-error)' : 'var(--color-border)'
                    }}
                  />
                  {errors.curp && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      {errors.curp.message}
                    </p>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Fecha de nacimiento
                  </label>
                  <input
                    {...register('birthDate')}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  />
                </div>

                {/* Nombre del tutor */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Nombre del tutor
                  </label>
                  <input
                    {...register('tutorName')}
                    placeholder="Ej. María García López"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  />
                </div>

                {/* Teléfono y email del tutor */}
                <div className="flex gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Teléfono tutor
                    </label>
                    <input
                      {...register('tutorPhone')}
                      placeholder="Ej. 6121234567"
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      Email tutor
                    </label>
                    <input
                      {...register('tutorEmail')}
                      placeholder="Ej. tutor@email.com"
                      type="email"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: `1px solid ${errors.tutorEmail ? 'var(--color-error)' : 'var(--color-border)'}`,
                        color: 'var(--color-text-primary)',
                      }}
                      onFocus={e => {
                        e.currentTarget.style.borderColor = errors.tutorEmail ? 'var(--color-error)' : 'var(--color-primary)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = errors.tutorEmail ? 'var(--color-error)' : 'var(--color-border)'
                      }}
                    />
                    {errors.tutorEmail && (
                      <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                        {errors.tutorEmail.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AppButton
              fullWidth
              isPending={isUpdating}
              pendingLabel='Guardando...'
            >
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </AppButton>
          </form>
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

      <ConfirmDialog
        open={!!confirmDeleteReportId}
        onOpenChange={open => { if (!open) setConfirmDeleteReportId(null) }}
        title="Eliminar reporte"
        description="¿Seguro que deseas eliminar este reporte? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (confirmDeleteReportId) {
            deleteReport(confirmDeleteReportId)
            setConfirmDeleteReportId(null)
          }
        }}
      />

      <ReportDialog
        open={openReport}
        onOpenChange={setOpenReport}
        studentId={studentId}
        studentName={`${student?.name} ${student?.firstLastName}`}
      />
    </ProtectedPage>
  )
}