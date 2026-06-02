import api from "@/lib/api/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface School {
  id: string
  name: string
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
  level: 'SECONDARY'
  active: boolean
  academicTerms: AcademicTerm[]
  _count: {
    groups: number
  }
}

interface CreateSchoolDto {
  name: string
  level: 'SECONDARY'
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
}

const shiftLabel = {
  MORNING: 'Matutino',
  AFTERNOON: 'Vespertino',
  EVENING: 'Nocturno'
}

export { shiftLabel }

interface Period {
  id: string
  number: number
  startDate: string
  endDate: string
  closed: boolean
}

interface AcademicTerm {
  id: string
  name: string
  startDate: string
  endDate: string
  active: boolean
  periods: Period[]
}

interface SchoolDetail extends School {
  academicTerms: AcademicTerm[]
}

interface CreateTermDto {
  name: string
  startDate: string
  endDate: string
}

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data } = await api.get<School[]>('/schools')
      return data
    },
  })
}

export function useSchool(schoolId: string) {
  return useQuery({
    queryKey: ['schools', schoolId],
    queryFn: async () => {
      const { data } = await api.get<SchoolDetail>(`/schools/${schoolId}`)
      return data
    },
    enabled: !!schoolId,
  })
}

export function useCreateSchool() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateSchoolDto) => {
      const { data } = await api.post<School>('/schools', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schools']
      })
    },
  })
}

export function useCreateTerm(schoolId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (dto: CreateTermDto) => {
      const { data } = await api.post(`/schools/${schoolId}/terms`, dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools', schoolId] })
    }
  })
}