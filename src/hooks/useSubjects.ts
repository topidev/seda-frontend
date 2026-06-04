import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'

interface GradeCategory {
  id: string
  subjectId: string
  name: string
  percentage: number
}

interface Subject {
  id: string
  name: string
  active: boolean
  gradeCategories: GradeCategory[]
  _count: { subjectTermGroups: number }
}

interface CreateSubjectDto {
  name: string
}

interface CreateGradeCategoryDto {
  name: string
  percentage: number
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data } = await api.get<Subject[]>('/subjects')
      return data
    },
  })
}

export function useSubject(subjectId: string) {
  return useQuery({
    queryKey: ['subjects', subjectId],
    queryFn: async () => {
      const { data } = await api.get<Subject>(`/subjects/${subjectId}`)
      return data
    },
    enabled: !!subjectId,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateSubjectDto) => {
      const { data } = await api.post<Subject>('/subjects', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      toast.success('Materia creada')
    },
    onError: () => {
      toast.error('Error al crear materia')
    }
  })
}

export function useCreateGradeCategory(subjectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateGradeCategoryDto) => {
      const { data } = await api.post(`/subjects/${subjectId}/categories`, dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', subjectId] })
      toast.success('Categoría creada')
    },
    onError: () => {
      toast.error('Error al crear categoría')
    }
  })
}

export function useDeleteGradeCategory(subjectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      await api.delete(`/subjects/${subjectId}/categories/${categoryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects', subjectId] })
      toast.success('Categoría eliminada')
    },
    onError: () => {
      toast.error('Error al eliminar')
    }
  })
}