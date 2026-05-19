import { create } from 'zustand'

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
  // Acciones
  setAccessToken: (token: string) => void
  setTeacher: (teacher: Teacher) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  teacher: null,

  setAccessToken: (token) => set({ accessToken: token }),

  setTeacher: (teacher) => set({ teacher }),

  logout: () => set({ accessToken: null, teacher: null }),
}))