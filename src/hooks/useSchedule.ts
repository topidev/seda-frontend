import api from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/api/error";
import { DaySchedule, Schedule, WeeklySchedule } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


type CreateScheduleDto = {
  dayOfWeek: number
  startTime: string,
  endTime?: string
}

export function useClassSchedule(subjectTermGroupId: string) {
  return useQuery({
    queryKey: ['schedule', subjectTermGroupId],
    queryFn: async () => {
      const { data } = await api.get<Schedule[]>(
        `/schedule/classes/${subjectTermGroupId}`,
      )
      return data
    },
    enabled: !!subjectTermGroupId,
  })
}

export function useCreateSchedule(subjectTermGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateScheduleDto) => {
      const { data } = await api.post<Schedule>(
        `/schedule/classes/${subjectTermGroupId}`,
        dto
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', subjectTermGroupId] })
      toast.success('Horario agregado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al agregar el horario'))
    }
  })
}

export function useDeleteSchedule(subjectTermGroupId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      await api.delete(`/schedule/${scheduleId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', subjectTermGroupId] })
      toast.success('Horarios eliminado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Erroe al eliminar el horario'))
    }
  })
}

export function useWeeklySchedule(weekOffSet: number = 0) {
  return useQuery({
    queryKey: ['weekly-schedule', weekOffSet],
    queryFn: async () => {
      const { data } = await api.get<WeeklySchedule>(
        `/schedule/weekly`, { params: { weekOffSet } }
      )
      return data
    }
  })
}

export function useTodaySchedule() {
  useQuery({
    queryKey: ['today-schedule'],
    queryFn: async () => {
      const { data } = await api.get<DaySchedule[]>(
        `/schedule/today`
      )
      return data
    }
  })
}