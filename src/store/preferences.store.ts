import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface PreferencesState {
  selectedSchoolId: string
  selectedTermId: string
  setSelectedSchool: (schoolId: string) => void
  setSelectedTerm: (termId: string) => void
  clearSelection: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      selectedSchoolId: '',
      selectedTermId: '',
      setSelectedSchool: (schoolId: string) => set({ selectedSchoolId: schoolId, selectedTermId: '' }),
      setSelectedTerm: (termId: string) => set({ selectedTermId: termId }),
      clearSelection: () => set({ selectedSchoolId: '', selectedTermId: '' }),
    }),
    {
      name: 'seda-preferences',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)