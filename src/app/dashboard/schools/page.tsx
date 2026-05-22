'use client'

import { useRequiredAuth } from "@/hooks/useAuthGuard"
import { shiftLabel, useSchools } from "@/hooks/useSchools"
import { GraduationCap, Plus, Users } from "lucide-react"
import Link from "next/link"

export default function SchoolsPage() {
  const { isAuthenticated, isReady } = useRequiredAuth()
  const { data: schools, isLoading } = useSchools()

  if (!isReady) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)' }}
        />
      </main>
    )
  }

  if (!isAuthenticated) return null

  return (
    <main
      className="min-h-screen p-8"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-2xl mx-auto">

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
              Mis escuelas
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {schools?.length ?? 0} escuelas registradas
            </p>
          </div>

          <Link href="/dashboard/schools/new">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-colors cursor-pointer"
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
              <Plus size={16} />
              Nueva escuela
            </button>
          </Link>
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
        {!isLoading && schools?.length === 0 && (
          <div
            className="rounded-2xl p-12 flex flex-col items-center gap-4"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <GraduationCap
              size={48}
              style={{ color: 'var(--color-text-disabled)' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Aún no tienes escuelas registradas
            </p>
            <Link href="/dashboard/schools/new">
              <button
                className="px-4 py-2 rounded-xl cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                }}
              >
                Registrar primera escuela
              </button>
            </Link>
          </div>
        )}

        {/* Lista de escuelas */}
        {!isLoading && schools && schools.length > 0 && (
          <div className="flex flex-col gap-3">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/dashboard/schools/${school.id}`}
              >
                <div
                  className="rounded-2xl p-5 flex items-center justify-between transition-colors cursor-pointer"
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                    >
                      <GraduationCap
                        size={20}
                        style={{ color: 'var(--color-primary)' }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {school.name}
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {shiftLabel[school.shift]}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-1 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Users size={14} />
                    {school._count.groups} grupos
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )

}