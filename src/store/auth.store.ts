import { access, stat } from 'fs'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Teacher {
  id: string
  email: string
  name: string
  lastName: string
  photo: string | null
  role: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  teacher: Teacher | null
  _hasHydrated: boolean
  // Acciones
  setAccessToken: (token: string) => void
  setTeacher: (teacher: Teacher) => void
  setRefreshToken: (token: string) => void
  setHasHydrated: (value: boolean) => void
  logout: () => void
}

export const useAuthStoreV1 = create<AuthState>((set) => ({
  accessToken: null,
  teacher: null,
  refreshToken: null,
  _hasHydrated: false,

  setAccessToken: (token) => set({ accessToken: token }),

  setRefreshToken: (token) => set({ refreshToken: token }),

  setTeacher: (teacher) => set({ teacher }),

  setHasHydrated: (value) => set({ _hasHydrated: value }),

  logout: () => set({ accessToken: null, teacher: null }),
}))

export const useAuthStore = create<AuthState>() (
  persist((set) => ({
    accessToken: null,
    refreshToken: null,
    teacher: null,
    _hasHydrated: false,

    setAccessToken: (token) => set({ accessToken: token }),
    setRefreshToken: (token) => set({ refreshToken: token }),
    setTeacher: (teacher) => set({ teacher }),
    setHasHydrated: (value) => set({ _hasHydrated: value }),
    logout: () => set({ accessToken: null, teacher: null })
  }),
  {
    name: 'seda-auth',
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({
      accessToken: state.accessToken,
      teacher: state.teacher,
    }),
    onRehydrateStorage: () => (state) => {
      state?.setHasHydrated(true)
    }
  })
)