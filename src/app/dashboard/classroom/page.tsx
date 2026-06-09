'use client'

import { useState, useMemo } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import Spinner from '@/components/Spinner'
import { useMyClasses } from '@/hooks/useClassroom'
import { Monitor, BookOpen, Search } from 'lucide-react'
import Link from 'next/link'

export default function ClassroomPage() {
  const { data: classes, isLoading } = useMyClasses()
  const [search, setSearch] = useState('')
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // Opciones únicas para los filtros
  const schools = useMemo(() => {
    const unique = new Map<string, string>()
    classes?.forEach(cls => {
      unique.set(cls.group.school.id, cls.group.school.name)
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [classes])

  const subjects = useMemo(() => {
    const unique = new Map<string, string>()
    classes?.forEach(cls => {
      unique.set(cls.subject.id, cls.subject.name)
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [classes])

  // Aplica filtros
  const filtered = useMemo(() => {
    return classes?.filter(cls => {
      const matchesSearch =
        !search ||
        cls.subject.name.toLowerCase().includes(search.toLowerCase()) ||
        cls.group.school.name.toLowerCase().includes(search.toLowerCase()) ||
        `${cls.group.grade}${cls.group.letter}`.toLowerCase().includes(search.toLowerCase())

      const matchesSchool =
        !selectedSchool || cls.group.school.id === selectedSchool

      const matchesSubject =
        !selectedSubject || cls.subject.id === selectedSubject

      return matchesSearch && matchesSchool && matchesSubject
    })
  }, [classes, search, selectedSchool, selectedSubject])

  // Agrupa por escuela
  const classesBySchool = useMemo(() => {
    return filtered?.reduce(
      (acc, cls) => {
        const schoolName = cls.group.school.name
        if (!acc[schoolName]) acc[schoolName] = []
        acc[schoolName].push(cls)
        return acc
      },
      {} as Record<string, typeof filtered>,
    )
  }, [filtered])

  const hasActiveFilters = search || selectedSchool || selectedSubject

  return (
    <ProtectedPage>
      <div className="mb-6">
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
          {filtered?.length ?? 0} de {classes?.length ?? 0} clases
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Búsqueda */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
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
            placeholder="Buscar por materia, escuela o grupo..."
            className="flex-1 outline-none bg-transparent text-sm"
            style={{ color: 'var(--color-text-primary)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs cursor-pointer"
              style={{ color: 'var(--color-text-disabled)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Selectores */}
        <div className="flex flex-col lg:flex-row gap-3">
          <select
            value={selectedSchool}
            onChange={e => setSelectedSchool(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: `1px solid ${selectedSchool ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: selectedSchool
                ? 'var(--color-text-primary)'
                : 'var(--color-text-disabled)',
            }}
          >
            <option value="">Todas las escuelas</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm cursor-pointer"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: `1px solid ${selectedSubject ? 'var(--color-primary)' : 'var(--color-border)'}`,
              color: selectedSubject
                ? 'var(--color-text-primary)'
                : 'var(--color-text-disabled)',
            }}
          >
            <option value="">Todas las materias</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch('')
              setSelectedSchool('')
              setSelectedSubject('')
            }}
            className="text-sm self-start cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            Limpiar filtros
          </button>
        )}
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

      {!isLoading && filtered?.length === 0 && classes && classes.length > 0 && (
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-3"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No hay clases que coincidan con los filtros
          </p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedSchool('')
              setSelectedSubject('')
            }}
            className="text-sm cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {!isLoading && classesBySchool && Object.keys(classesBySchool).length > 0 && (
        <div className="flex flex-col gap-8">
          {Object.entries(classesBySchool).map(([schoolName, schoolClasses]) => (
            <div key={schoolName}>
              <h2
                className="text-xs font-medium mb-3 uppercase tracking-wider"
                style={{ color: 'var(--color-text-disabled)' }}
              >
                {schoolName}
              </h2>
              <div className="flex flex-col gap-3">
                {schoolClasses.map(cls => (
                  <Link key={cls.id} href={`/dashboard/classroom/${cls.id}`}>
                    <div
                      className="rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-colors flex-col lg:flex-row"
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
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
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