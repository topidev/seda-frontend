'use client'

import BackButton from "@/components/BackButton";
import ProtectedPage from "@/components/ProtectedPage";
import Spinner from "@/components/Spinner";
import { useClassDetail } from "@/hooks/useClassroom";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ClassDetailPage() {
  const params = useParams()
  const subjectTermGroupId = params.id as string

  const { data: cls, isLoading } = useClassDetail(subjectTermGroupId)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  if (isLoading) {
    return (
      <ProtectedPage>
        <Spinner />
      </ProtectedPage>
    )
  }

  const activePeriod = selectedPeriod ?? cls?.academicTerm.periods?.[0]?.id

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BackButton href="/dashboard/classroom" />
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-geist)',
            }}
          >
            {cls?.subject.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {cls?.group.grade}°{cls?.group.letter} · {cls?.group.school.name} · {cls?.academicTerm.name}
          </p>
        </div>
      </div>

      {/* Selector de bimestres */}
      <div className="flex gap-2 mb-6">
        {cls?.academicTerm.periods?.map(period => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: activePeriod === period.id
                ? 'var(--color-primary)'
                : 'var(--color-bg-elevated)',
              border: `1px solid ${activePeriod === period.id
                ? 'var(--color-primary)'
                : 'var(--color-border)'}`,
              color: activePeriod === period.id
                ? 'white'
                : 'var(--color-text-secondary)',
            }}
          >
            B{period.number}
          </button>
        ))}
      </div>

      {/* Info del bimestre seleccionado */}
      {cls && activePeriod && (
        <div className="flex flex-col gap-3">
          {/* Card de pasar lista */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/attendance`}>
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Pasar lista
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Registrar asistencia del día
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Card de actividades */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/periods/${activePeriod}/activities`}>
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Actividades
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Tareas, exámenes, proyectos
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Card de calificaciones */}
          <Link href={`/dashboard/classroom/${subjectTermGroupId}/periods/${activePeriod}/grades`}>
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
              <div>
                <p
                  className="font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Calificaciones bimestrales
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Resumen y calificación final de cada alumno
                </p>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--color-text-disabled)' }} />
            </div>
          </Link>

          {/* Resumen de alumnos */}
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p
              className="font-medium mb-3"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Alumnos ({cls.group.studentGroupTerms.length})
            </p>
            <div className="flex flex-col gap-2">
              {cls.group.studentGroupTerms.map(sgt => (
                <div
                  key={sgt.id}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {sgt.student.name[0]}{sgt.student.firstLastName[0]}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {sgt.student.name} {sgt.student.firstLastName} {sgt.student.secondLastName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ProtectedPage>
  )
}