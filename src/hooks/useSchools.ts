import api from "@/lib/api/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { School, CreateSchoolDto, AcademicTerm, CreateTermDto } from "@/types"
import { boolean, string } from "zod"

const shiftLabel = {
  MORNING: 'Matutino',
  AFTERNOON: 'Vespertino',
  EVENING: 'Nocturno'
}

export { shiftLabel }

interface SchoolDetail extends School {
  academicTerms: AcademicTerm[]
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
      toast.success('Escuela creada')
    },
    onError: () => {
      toast.error('Error al crear la escuela')
    }
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
      toast.success('Ciclo escolar creado')
    },
    onError: () => {
      toast.error('Error al crear el ciclo escolar')
    }
  })
}

export function useToggleTermClose(schoolId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      termId,
      active,
    }: {
      termId: string
      active: boolean
    }) => {
      const { data } = await api.patch(
        `/school/${schoolId}/terms/${termId}/toggle-close`,
        { active }
      )
      return data
    },
    onSuccess: (_, active) => {
      queryClient.invalidateQueries({ queryKey: ['schools', schoolId] })
      toast.success(active ? 'Ciclo reabierto' : 'Ciclo cerrado')
    },
    onError: () => toast.error('Error al cambiar el estado del ciclo')
  })
}