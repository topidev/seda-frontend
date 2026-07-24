import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
import type { Group, CreateGroupDto } from '@/types'
import { getErrorMessage } from '@/lib/api/error'


export function useGroups(schoolId: string, academicTermId: string) {
  return useQuery({
    queryKey: ['groups', schoolId, academicTermId],
    queryFn: async () => {
      const { data } = await api.get<Group[]>('/groups', {
        params: { schoolId, academicTermId },
      })
      return data
    },
    enabled: !!schoolId && !!academicTermId,
  })
}

export function useGroup(groupId: string, academicTermId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: async () => {
      const { data } = await api.get<Group>(`/groups/${groupId}`, {
        params: { academicTermId },
      })
      return data
    },
    enabled: !!groupId && !!academicTermId,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateGroupDto) => {
      const { data } = await api.post<Group>('/groups', dto)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['groups', variables.schoolId, variables.academicTermId],
      })
      toast.success('Grupo creado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al crear el grupo'))
    }
  })
}

export function useAssignSubjectToGroup(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: { subjectId: string; academicTermId: string }) => {
      const { data } = await api.post(`/groups/${groupId}/subjects`, body)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      toast.success('Materia asignada')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al asignar materia'))
    }
  })
}

export function useRemoveSubjectFromGroup(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (subjectTermGroupId: string) => {
      await api.delete(`/groups/${groupId}/subjects/${subjectTermGroupId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      toast.success('Materia removida del grupo')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al remover la materia'))
    },
  })
}

export function useRemoveStudentFromGroup(groupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (studentGroupTermId: string) => {
      await api.delete(`/groups/${groupId}/students/${studentGroupTermId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      toast.success('Alumno removido del grupo')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al remover al alumno'))
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      await api.delete(`/groups/${groupId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Grupo eliminado correctamente')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al eliminar el grupo'))
    },
  })
}