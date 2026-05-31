'use client'

import { useTeacher } from "@/hooks/useTeacher";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";

export default function ProfilePage() {
  const { data: teacher, isLoading, isError } = useTeacher()
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await api.get('auth/logout')
    } finally {
      logout()
      router.replace('/login')
    }
  }


  if (isLoading) {
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
  if (isError) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <p style={{ color: 'var(--color-error)' }}>
          Error al cargar el perfil
        </p>
      </main>
    )
  }
  return (
    <ProtectedPage>

      {/* Card del perfil */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Foto y nombre */}
        <div className="flex items-center gap-4 mb-6">
          {teacher?.photo ? (
            <Image
              src={teacher.photo}
              alt={teacher.name}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            // Iniciales si no hay foto
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontFamily: 'var(--font-geist)',
              }}
            >
              {teacher?.name?.[0]}{teacher?.lastName?.[0]}
            </div>
          )}

          <div>
            <h1
              className="text-xl font-semibold"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-geist)',
              }}
            >
              {teacher?.name} {teacher?.lastName}
            </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {teacher?.email}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          className="mb-6"
          style={{ borderTop: '1px solid var(--color-divider)' }}
        />

        {/* Info */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Rol
            </span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {teacher?.role === 'TEACHER' ? 'Maestro' : 'Super Admin'}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Miembro desde
            </span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {teacher?.createdAt
                ? new Date(teacher.createdAt).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
                : '-'}
            </span>
          </div>
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-error)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-error)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
            e.currentTarget.style.color = 'var(--color-error)'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </ProtectedPage>
  )

}