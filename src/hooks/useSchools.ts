import api from "@/lib/api/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface School {
  id: string
  name: string
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
  level: 'SECONDARY'
  active: boolean
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

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data } = await api.get<School[]>('/schools')
      return data
    },
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