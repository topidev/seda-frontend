import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequiredAuth() {
    const router = useRouter()
    const accessToken = useAuthStore((state) => state.accessToken)
    const hasHydrated = useAuthStore((state) => state._hasHydrated)

    useEffect(() => {
        if(!hasHydrated) return
        if(!accessToken) {
            router.replace("/login")
        }
    }, [accessToken, hasHydrated])

    return { 
        isAuthenticated: !!accessToken,
        isReady: hasHydrated 
    }
}

export function useRedirectIfAuthenticated() {
    const router = useRouter()
    const accessToken = useAuthStore((state) => state.accessToken)
    const hasHydrated = useAuthStore((state) => state._hasHydrated)

    useEffect(() => {
        if (!hasHydrated) return
        if (accessToken) {
            router.replace("/dashboard")
        }
    }, [accessToken, hasHydrated])

    return { 
        isAuthenticated: !!accessToken,
        isReady: hasHydrated
    }
}