import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Teacher } from '@/types'

interface AuthState {
  teacher: Teacher | null
  accessToken: string | null
  refreshToken: string | null
  _hasHydrated: boolean
  // Acciones
  setTeacher: (teacher: Teacher) => void
  setAccessToken: (token: string) => void
  setHasHydrated: (value: boolean) => void
  setRefreshToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    teacher: null,
    accessToken: null,
    _hasHydrated: false,
    refreshToken: null,

    setTeacher: (teacher) => set({ teacher }),
    setAccessToken: (token) => set({ accessToken: token }),
    setHasHydrated: (value) => set({ _hasHydrated: value }),
    setRefreshToken: (token) => set({ refreshToken: token }),
    logout: () => set({ accessToken: null, refreshToken: null, teacher: null }),
  }),
    {
      name: 'seda-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        teacher: state.teacher,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    })
)