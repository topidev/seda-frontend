import api from "@/lib/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateEventDto, Event } from '@/types/index'
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/error";
import { error } from "console";

export function useAllEvents(schoolId?: string) {
  return useQuery({
    queryKey: ['events', 'all', schoolId],
    queryFn: async () => {
      const { data } = await api.get<Event[]>('/events', {
        params: schoolId ? { schoolId } : undefined
      })
      return data
    }
  })
}

export function useUpcomingEvents(days: number = 30) {
  return useQuery({
    queryKey: ['events', 'upcoming', days],
    queryFn: async () => {
      const { data } = await api.get<Event[]>('/events/upcoming', {
        params: { days },
      })
      return data
    }
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateEventDto) => {
      const { data } = await api.post<Event>('/events', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Evento creado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al crear evento'))
    }
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/events/${eventId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] }),
        toast.success('Evento eliminado')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Error al eliminar el evento'))
    }
  })
}