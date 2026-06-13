import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise< { outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        const alreadyInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
        setIsInstalled(alreadyInstalled)

        const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
        setIsIOS(ios)

        const handler = (e: Event) => {
            e.preventDefault()
            setInstallPrompt(e as BeforeInstallPromptEvent)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const promptInstall = async() => {
        if (!installPrompt) return
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') { setInstallPrompt(null) }
    }
    return {
        canInstall: !!installPrompt,
        isInstalled,
        isIOS,
        promptInstall
    }
}