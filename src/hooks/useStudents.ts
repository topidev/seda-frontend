import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'

interface StudentGroupTerm {
  id: string
  groupId: string
  group: { id: string; grade: string; letter: string }
}

interface Student {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
  birthDate: string | null
  tutorName: string | null
  tutorPhone: string | null
  deletedAt: string | null
  groupTerms: StudentGroupTerm[]
}

interface CreateStudentDto {
  name: string
  firstLastName: string
  secondLastName?: string
  birthDate?: string
  tutorName?: string
  tutorPhone?: string
  groupId: string
  academicTermId: string
}

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
    },
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
    },
  })
}