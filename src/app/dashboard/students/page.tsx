'use client'

import { useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import { useStudents } from '@/hooks/useStudents'
import { UserSquare, Search } from 'lucide-react'
import Link from 'next/link'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const { data: students, isLoading } = useStudents({
    search: search || undefined,
    inactive: showInactive,
  })

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
            Alumnos
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {students?.length ?? 0} alumnos encontrados
          </p>
        </div>

        <button
          onClick={() => setShowInactive(!showInactive)}
          className="px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
          style={{
            backgroundColor: showInactive
              ? 'var(--color-bg-tertiary)'
              : 'var(--color-bg-elevated)',
            border: `1px solid ${showInactive
              ? 'var(--color-primary)'
              : 'var(--color-border)'}`,
            color: showInactive
              ? 'var(--color-primary)'
              : 'var(--color-text-secondary)',
          }}
        >
          {showInactive ? 'Ver activos' : 'Ver inactivos'}
        </button>
      </div>

      {/* Buscador */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Search size={16} style={{ color: 'var(--color-text-disabled)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o apellido..."
          className="flex-1 outline-none bg-transparent"
          style={{ color: 'var(--color-text-primary)' }}
        />
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
      {!isLoading && students?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <UserSquare
            size={48}
            style={{ color: 'var(--color-text-disabled)' }}
          />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {search
              ? 'No se encontraron alumnos con ese nombre'
              : 'Aún no tienes alumnos registrados'}
          </p>
        </div>
      )}

      {/* Lista de alumnos */}
      {!isLoading && students && students.length > 0 && (
        <div className="flex flex-col gap-2">
          {students.map(student => (
            <Link key={student.id} href={`/dashboard/students/${student.id}`}>
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  opacity: student.deletedAt ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {student.name[0]}{student.firstLastName[0]}
                  </div>
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {student.name} {student.firstLastName}{' '}
                      {student.secondLastName}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {student.groupTerms.length > 0
                        ? student.groupTerms
                            .map(gt => `${gt.group.grade}°${gt.group.letter}`)
                            .join(', ')
                        : 'Sin grupo asignado'}
                    </p>
                  </div>
                </div>

                {student.deletedAt && (
                  <span
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-disabled)',
                    }}
                  >
                    Inactivo
                  </span>
                )}
              </div>
              </Link>
          ))}
        </div>
      )}
    </ProtectedPage>
  )
}