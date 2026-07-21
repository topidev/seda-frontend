'use client'

import { useRef, useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import { useStudents } from '@/hooks/useStudents'
import { UserSquare, Search } from 'lucide-react'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  const { data: students, isLoading } = useStudents({
    search: search || undefined,
    inactive: showInactive,
  })

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: students?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5
  })

  return (
    <ProtectedPage>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-xl md:text-2xl font-semibold"
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
        <div
          ref={parentRef}
          style={{
            height: 'calc(100vh - 280px)',
            overflow: 'auto',
            border: '1px solid var(--color-border)',
            borderRadius: '16px'
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative'
            }}
          >
            {virtualizer.getVirtualItems().map(virtualRow => {
              const student = students[virtualRow.index]
              const isLast = virtualRow.index == students.length - 1
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                >
                  <Link href={`/dashboard/students/${student.id}`}>
                    <div
                      className="flex items-center gap-4 px-4 h-full transition-colors cursor-pointer"
                      style={{
                        backgroundColor: virtualRow.index % 2 === 0
                          ? 'var(--color-bg-elevated)'
                          : 'var(--color-bg-secondary)',
                        borderBottom: isLast
                          ? 'none'
                          : '1px solid var(--color-divider)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = virtualRow.index % 2 === 0
                          ? 'var(--color-bg-elevated)'
                          : 'var(--color-bg-secondary)'
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                        style={{
                          backgroundColor: 'var(--color-bg-tertiary)',
                          color: 'var(--color-primary)',
                        }}
                      >
                        {student.name[0]}{student.firstLastName[0]}
                      </div>
                      <div className="flex-1 flex w-full justify-between min-w-0">
                        <p
                          className="font-medium text-sm truncate"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {student.name} {student.firstLastName}{' '}
                          {student.secondLastName}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {student.groupTerms?.[0]?.group?.grade + student.groupTerms?.[0]?.group?.letter}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </ProtectedPage>
  )
}