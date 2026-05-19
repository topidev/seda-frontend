import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequiredAuth() {
    const router = useRouter()
    const accessToken = useAuthStore((state) => state.accessToken)

    useEffect(() => {
        if(!accessToken) {
            router.replace("/login")
        }
    }, [accessToken])

    return { isAuthenticated: !!accessToken }
}

export function useRedirectIfAuthenticated() {
    const router = useRouter()
    const accessToken = useAuthStore((state) => state.accessToken)

    useEffect(() => {
        if(accessToken) {
            router.replace("/dashboard")
        }
    }, [accessToken])

    return { isAuthenticated: !!accessToken }
}