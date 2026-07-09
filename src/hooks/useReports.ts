import api from "@/lib/api/axios";
import { CreateReportDto } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Report } from "@/types";

export function useStudentReports(studentId: string) {
  return useQuery({
    queryKey: [
      'reports',
      studentId
    ],
    queryFn: async () => {
      const { data } = await api.get<Report[]>(`/reports/students/${studentId}`)
      return data
    },
    enabled: !!studentId
  })
}

export function useCreateReport(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: CreateReportDto) => {
      const { data } = await api.post<Report>('/reports', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', studentId] })
      toast.success('Reporte creado correctamente')
    },
    onError: () => {
      toast.error('Error al crear el reporte')
    }
  })
}

export function useDeleteReport(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/resports/${reportId}`)
      toast.success('Reporte eliminado')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', studentId] })
      toast.success('Reporte eliminado')
    },
    onError: () => {
      toast.error('Error al borrar el reporte')
    }
  })
}