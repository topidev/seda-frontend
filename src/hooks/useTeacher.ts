import api from "@/lib/api/axios"
import { useAuthStore } from "@/store/auth.store"
import { useQuery } from "@tanstack/react-query"
import type { Teacher } from "@/types"

export function useTeacher() {
    const accessToken = useAuthStore((state) => state.accessToken)

    return useQuery({
        queryKey: ['teacher', 'me'],
        queryFn: async () => {
            const { data } = await api.get<Teacher>('/auth/me')
            return data
        },
        enabled: !!accessToken
    })
}