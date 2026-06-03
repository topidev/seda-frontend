'use client'

import { useState } from 'react'
import ProtectedPage from '@/components/ProtectedPage'
import { useSchools } from '@/hooks/useSchools'
import { useGroups, useCreateGroup } from '@/hooks/useGroups'
import { useSubjects } from '@/hooks/useSubjects'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Plus } from 'lucide-react'
import Link from 'next/link'
import Spinner from '@/components/Spinner'
import AppButton from '@/components/AppButton'

const grades = ['1', '2', '3']
const letters = ['A', 'B', 'C', 'D', 'E']

export default function GroupsPage() {
  const { data: schools } = useSchools()
  const { data: subjects } = useSubjects()

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [selectedTermId, setSelectedTermId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [grade, setGrade] = useState('1')
  const [letter, setLetter] = useState('A')
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])

  const selectedSchool = schools?.find(s => s.id === selectedSchoolId)

  const { data: groups, isLoading } = useGroups(selectedSchoolId, selectedTermId)
  const { mutate: createGroup, isPending, isError } = useCreateGroup()

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId)
    setSelectedTermId('')
  }

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId],
    )
  }

  const handleSubmit = () => {
    if (!selectedSchoolId || !selectedTermId) return

    createGroup(
      {
        schoolId: selectedSchoolId,
        grade,
        letter,
        academicTermId: selectedTermId,
        subjectIds: selectedSubjectIds,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setGrade('1')
          setLetter('A')
          setSelectedSubjectIds([])
        },
      },
    )
  }

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
            Grupos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona una escuela y ciclo para ver sus grupos
          </p>
        </div>

        {selectedSchoolId && selectedTermId && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)'
            }}
          >
            <Plus size={16} />
            Nuevo grupo
          </button>
        )}
      </div>

      {/* Selectores */}
      <div className="flex gap-3 mb-6">
        {/* Selector escuela */}
        <select
          value={selectedSchoolId}
          onChange={e => handleSchoolChange(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: selectedSchoolId
              ? 'var(--color-text-primary)'
              : 'var(--color-text-disabled)',
          }}
        >
          <option value="">Selecciona una escuela</option>
          {schools?.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>

        {/* Selector ciclo */}
        <select
          value={selectedTermId}
          onChange={e => setSelectedTermId(e.target.value)}
          disabled={!selectedSchoolId}
          className="flex-1 px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: selectedTermId
              ? 'var(--color-text-primary)'
              : 'var(--color-text-disabled)',
            opacity: !selectedSchoolId ? 0.5 : 1,
          }}
        >
          <option value="">Selecciona un ciclo</option>
          {selectedSchool?.academicTerms?.map(term => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && selectedSchoolId && selectedTermId && (
        <Spinner />
      )}

      {/* Sin selección */}
      {!selectedSchoolId && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-3"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Users size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Selecciona una escuela para ver sus grupos
          </p>
        </div>
      )}

      {/* Lista vacía */}
      {!isLoading && selectedSchoolId && selectedTermId && groups?.length === 0 && (
        <div
          className="rounded-2xl p-12 flex flex-col items-center gap-4"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Users size={48} style={{ color: 'var(--color-text-disabled)' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No hay grupos en este ciclo
          </p>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl cursor-pointer"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          >
            Crear primer grupo
          </button>
        </div>
      )}

      {/* Lista de grupos */}
      {!isLoading && groups && groups.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/dashboard/groups/${group.id}?academicTermId=${selectedTermId}`}
            >
              <div
                className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-colors"
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
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                  <span
                    className="text-lg font-semibold"
                    style={{
                      color: 'var(--color-primary)',
                      fontFamily: 'var(--font-geist)',
                    }}
                  >
                    {group.grade}°{group.letter}
                  </span>
                </div>
                <div>
                  <p
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {group.grade}° {group.letter}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {group.studentGroupTerms.length} alumnos
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
                    {group.subjectTermGroups.length} materias
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal nuevo grupo */}
      <Dialog open={open} onOpenChange={setOpen}>
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
              Nuevo grupo
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5 mt-2">
            {/* Grado */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Grado
              </label>
              <div className="flex gap-2">
                {grades.map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: grade === g
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-tertiary)',
                      border: `1px solid ${grade === g
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'}`,
                      color: grade === g ? 'white' : 'var(--color-text-secondary)',
                    }}
                  >
                    {g}°
                  </button>
                ))}
              </div>
            </div>

            {/* Letra */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Grupo
              </label>
              <div className="flex gap-2">
                {letters.map(l => (
                  <button
                    key={l}
                    onClick={() => setLetter(l)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                    style={{
                      backgroundColor: letter === l
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-tertiary)',
                      border: `1px solid ${letter === l
                        ? 'var(--color-primary)'
                        : 'var(--color-border)'}`,
                      color: letter === l ? 'white' : 'var(--color-text-secondary)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Materias */}
            {subjects && subjects.length > 0 && (
              <div className="flex flex-col gap-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Materias a impartir (opcional)
                </label>
                <div className="flex flex-col gap-2">
                  {subjects.map(subject => (
                    <button
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer"
                      style={{
                        backgroundColor: selectedSubjectIds.includes(subject.id)
                          ? 'rgba(37, 99, 235, 0.1)'
                          : 'var(--color-bg-tertiary)',
                        border: `1px solid ${selectedSubjectIds.includes(subject.id)
                          ? 'var(--color-primary)'
                          : 'var(--color-border)'}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: selectedSubjectIds.includes(subject.id)
                            ? 'var(--color-primary)'
                            : 'transparent',
                          border: `1.5px solid ${selectedSubjectIds.includes(subject.id)
                            ? 'var(--color-primary)'
                            : 'var(--color-border)'}`,
                        }}
                      >
                        {selectedSubjectIds.includes(subject.id) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span style={{ color: 'var(--color-text-primary)' }}>
                        {subject.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isError && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                Ocurrió un error al crear el grupo. Intenta de nuevo.
              </p>
            )}

            <AppButton
              onClick={handleSubmit}
              disabled={isPending}
              isPending={isPending}
              pendingLabel='Creando'
            >
              Crear grupo
            </AppButton>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedPage>
  )
}