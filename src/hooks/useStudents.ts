import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
import type { Student, CreateStudentDto, UpdateStudentDto } from '@/types'
import { useRouter } from 'next/navigation'


export function useStudents(filters?: {
  groupId?: string
  academicTermId?: string
  search?: string
  inactive?: boolean
}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const { data } = await api.get<Student[]>('/students', {
        params: filters,
      })
      return data
    },
  })
}

export function useCreateStudent(groupId: string, academicTermId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateStudentDto) => {
      const { data } = await api.post<Student>('/students', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      toast.success('Alumno creado')
    },
    onError: () => {
      toast.error('Error al crear alumno')
    }
  })
}

export function useAssignStudentToGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: {
      studentId: string
      groupId: string
      academicTermId: string
    }) => {
      const { data } = await api.post(`/students/${body.studentId}/assign`, {
        groupId: body.groupId,
        academicTermId: body.academicTermId,
      })
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['groups', variables.groupId] })
      toast.success('Alumno asignado')
    },
    onError: () => {
      toast.error('Error al asignar alumno')
    }
  })
}

export function useUpdateStudent(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: Partial<UpdateStudentDto>) => {
      const { data } = await api.patch(`/students/${studentId}`, dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', studentId] }),
        queryClient.invalidateQueries({ queryKey: ['students'] }),
        toast.success('Alumno actualizado')
    },
    onError: () => {
      toast.error('Error al actualizar alumno')
    }
  })
}

export function useRemoveStudent(studentId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/students/${studentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success('Alumno eliminado correctamente')
      router.replace('/dashboard/students')
    },
    onError: () => {
      toast.error('Error al eliminar el alumno')
    },
  })
}