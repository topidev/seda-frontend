'use client'

import ProtectedPage from "@/components/ProtectedPage";
import Spinner from "@/components/Spinner";
import { useMyClasses } from "@/hooks/useClassroom";
import { Monitor, BookOpen } from "lucide-react";
import Link from "next/link";

export default function ClassroomPage() {
  const { data: classes, isLoading } = useMyClasses()

  // Agrupar por escuela
  const classesBySchool = classes?.reduce(
    (acc, cls) => {
      const schoolName = cls.group.school.name
      if (!acc[schoolName]) acc[schoolName] = []
      acc[schoolName].push(cls)
      return acc
    }, {} as Record<string, typeof classes>,
  )

  return (
    <ProtectedPage>
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold"
          style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-geist)',
          }}
        >
          Mis clases
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {classes?.length ?? 0} clases en el ciclo activo
        </p>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && classes?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Monitor size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No tienes clases asignadas en el ciclo activo
          </p>
          <p className="text-sm text-center" style={{ color: 'var(--color-text-disabled)' }}>
            Ve a Grupos y asigna materias a tus grupos para ver tus clases aquí
          </p>
        </div>
      )}

      {!isLoading && classesBySchool && (
        <div className="flex flex-col gap-8">
          {Object.entries(classesBySchool).map(([schoolName, schoolClasses]) => (
            <div key={schoolName}>
              <h2
                className="text-sm font-medium mb-3 uppercase tracking-wider"
                style={{ color: 'var(--color-text-disabled)' }}
              >
                {schoolName}
              </h2>
              <div className="flex flex-col gap-3">
                {schoolClasses.map(cls => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/classroom/${cls.id}`}
                  >
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
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
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
                            {cls.subject.name}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            {cls.group.grade}°{cls.group.letter} · {cls.academicTerm.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="text-sm"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {cls.group.studentGroupTerms?.length ?? 0} alumnos
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: 'var(--color-text-disabled)' }}
                        >
                          {cls._count.activities} actividades
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </ProtectedPage>
  )
}