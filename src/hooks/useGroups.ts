import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'
import type { Group, CreateGroupDto } from '@/types'


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
    onError: () => {
      toast.error('Error al crear el grupo')
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
    onError: () => {
      toast.error('Error al asignar materia')
    }
  })
}