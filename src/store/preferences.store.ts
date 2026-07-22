import { SubjectTermGroup } from "@/types"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface PreferencesState {
  selectedSchoolId: string
  selectedTermId: string
  selectedPeriodByClass: Record<string, string>
  setSelectedSchool: (schoolId: string) => void
  setSelectedTerm: (termId: string) => void
  setSelectedPeriod: (subjectTermGroupId: string, periodId: string) => void
  getSelectedPeriod: (subjectTermGroupId: string) => string
  clearSelection: () => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      selectedSchoolId: '',
      selectedTermId: '',
      selectedPeriodByClass: {},

      setSelectedSchool: (schoolId: string) => set({
        selectedSchoolId: schoolId,
        selectedTermId: ''
      }),
      setSelectedTerm: (termId: string) => set({ selectedTermId: termId }),
      setSelectedPeriod: (subjectTermGroupId, periodId) => set(state => ({
        selectedPeriodByClass: {
          ...state.selectedPeriodByClass,
          [subjectTermGroupId]: periodId
        }
      })),
      getSelectedPeriod: (subjectTermGroupId) => {
        return get().selectedPeriodByClass[subjectTermGroupId] ?? ''
      },
      clearSelection: () => set({ selectedSchoolId: '', selectedTermId: '' }),
    }),
    {
      name: 'seda-preferences',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
)