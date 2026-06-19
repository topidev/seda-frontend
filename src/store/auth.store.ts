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
  setTeacher: (teacher: Teacher) => void
  setAccessToken: (token: string) => void
  setHasHydrated: (value: boolean) => void
  logout: () => void
  // refreshToken: string | null
  // setRefreshToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    teacher: null,
    accessToken: null,
    _hasHydrated: false,
    // refreshToken: null,

    setTeacher: (teacher) => set({ teacher }),
    setAccessToken: (token) => set({ accessToken: token }),
    setHasHydrated: (value) => set({ _hasHydrated: value }),
    logout: () => set({ accessToken: null, teacher: null })
    // setRefreshToken: (token) => set({ refreshToken: token }),
  }),
    {
      name: 'seda-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        teacher: state.teacher,
        accessToken: state.accessToken,
        // refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    })
)