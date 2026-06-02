import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'

interface Student {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
}

interface Subject {
  id: string
  name: string
}

interface SubjectTermGroup {
  id: string
  subjectId: string
  subject: Subject
}

interface StudentGroupTerm {
  id: string
  studentId: string
  student: Student
}

interface Group {
  id: string
  schoolId: string
  grade: string
  letter: string
  active: boolean
  subjectTermGroups: SubjectTermGroup[]
  studentGroupTerms: StudentGroupTerm[]
}

interface CreateGroupDto {
  schoolId: string
  grade: string
  letter: string
  academicTermId: string
  subjectIds?: string[]
}

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
    },
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
    },
  })
}