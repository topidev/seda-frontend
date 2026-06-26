import api from "@/lib/api/axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { SubjectTermGroup, Activity, FinalGrade, AttendanceRecord, CreateActivityDto, StudentGradeDto } from '@/types'


export function useMyClasses() {
  return useQuery({
    queryKey: ['classroom'],
    queryFn: async () => {
      const { data } = await api.get<SubjectTermGroup[]>('/classroom')
      return data
    }
  })
}

export function useClassDetail(subjectTermGroupId: string) {
  return useQuery({
    queryKey: ['classroom', subjectTermGroupId],
    queryFn: async () => {
      const { data } = await api.get<SubjectTermGroup>(`/classroom/${subjectTermGroupId}`)
      return data
    },
    enabled: !!subjectTermGroupId
  })
}

export function useActivities(subjectTermGroupId: string, periodId: string) {
  return useQuery({
    queryKey: ['activities', subjectTermGroupId, periodId],
    queryFn: async () => {
      const { data } = await api.get<Activity[]>(`/classroom/${subjectTermGroupId}/periods/${periodId}/activities`)
      return data
    },
    enabled: !!subjectTermGroupId && !!periodId
  })
}

export function useCreateActivity(subjectTermGroupId: string, periodId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateActivityDto) => {
      const { data } = await api.post<Activity>(`/classroom/${subjectTermGroupId}/periods/${periodId}/activities`, dto)
      return data
    },
    onSuccess: () => {
      toast.success('Actividad creada')
      queryClient.invalidateQueries({
        queryKey: ['activities', subjectTermGroupId, periodId]
      })
    },
    onError: () => {
      toast.error('Error al crear la actividad')
    }
  })
}

export function useDeleteActivity(
  subjectTermGroupId: string,
  periodId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string) => {
      await api.delete(`/classroom/activities/${activityId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['activities', subjectTermGroupId, periodId],
      })
      toast.success('Actividad eliminada')
    },
    onError: () => {
      toast.error('Error al eliminar la actividad')
    },
  })
}

export function useGradeActivity(activityId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (grades: StudentGradeDto[]) => {
      const { data } = await api.post(
        `/classroom/activities/${activityId}/grades`,
        { grades },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['period-grades'] })
      toast.success('Calificaciones guardadas')
    },
    onError: () => {
      toast.error('Error al guardar las calificaciones')
    },
  })
}

export function usePeriodGrades(
  subjectTermGroupId: string,
  periodId: string,
) {
  return useQuery({
    queryKey: ['period-grades', subjectTermGroupId, periodId],
    queryFn: async () => {
      const { data } = await api.get<FinalGrade[]>(
        `/classroom/${subjectTermGroupId}/periods/${periodId}/grades`,
      )
      return data
    },
    enabled: !!subjectTermGroupId && !!periodId,
  })
}

export function useOverrideFinalGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: {
      finalGradeId: string
      finalScore: number
      overrideReason?: string
    }) => {
      const { data } = await api.patch(
        `/classroom/grades/${dto.finalGradeId}/override`,
        {
          finalScore: dto.finalScore,
          overrideReason: dto.overrideReason
        }
      )
      return data
    },
    onSuccess: () => {
      toast.success('Calificación actualizada')
      queryClient.invalidateQueries({
        queryKey: ['period-grades']
      })
    },
    onError: () => {
      toast.error('Error al actualizar calificación')
    }
  })
}

export function useAttendanceByDate(
  subjectTermGroupId: string,
  date: string,
) {
  return useQuery({
    queryKey: ['attendance', subjectTermGroupId, date],
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>(
        `/classroom/${subjectTermGroupId}/attendance`,
        { params: { date } },
      )
      return data
    },
    enabled: !!subjectTermGroupId && !!date,
  })
}

export function useSaveAttendance(subjectTermGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: {
      date: string
      records: { studentId: string; status: string }[]
    }) => {
      const { data } = await api.post(
        `/classroom/${subjectTermGroupId}/attendance`,
        body,
      )
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attendance', subjectTermGroupId, variables.date],
      })
      toast.success('Lista guardada correctamente')
    },
    onError: () => {
      toast.error('Error al guardar la lista')
    },
  })
}

export function useAttendanceHistory(subjectTermGroupId: string) {
  return useQuery({
    queryKey: ['attendance-history', subjectTermGroupId],
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>(
        `/classroom/${subjectTermGroupId}/attendance/history`,
      )
      return data
    },
    enabled: !!subjectTermGroupId,
  })
}