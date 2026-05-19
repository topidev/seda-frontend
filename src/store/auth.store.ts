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
  teacher: Teacher | null
  _hasHydrated: boolean
  // Acciones
  setAccessToken: (token: string) => void
  setTeacher: (teacher: Teacher) => void
  setHasHydrated: (value: boolean) => void
  logout: () => void
}

export const useAuthStoreV1 = create<AuthState>((set) => ({
  accessToken: null,
  teacher: null,
  _hasHydrated: false,

  setAccessToken: (token) => set({ accessToken: token }),

  setTeacher: (teacher) => set({ teacher }),

  setHasHydrated: (value) => set({ _hasHydrated: value }),

  logout: () => set({ accessToken: null, teacher: null }),
}))

export const useAuthStore = create<AuthState>() (
  persist((set) => ({
    accessToken: null,
    teacher: null,
    _hasHydrated: false,

    setAccessToken: (token) => set({ accessToken: token }),
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