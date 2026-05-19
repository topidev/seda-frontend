import api from "@/lib/api/axios"
import { useAuthStore } from "@/store/auth.store"
import { useQuery } from "@tanstack/react-query"

interface Teacher {
    id: string
    email: string
    name: string
    lastName: string
    photo: string | null
    role: string
    createdAt: string
}

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