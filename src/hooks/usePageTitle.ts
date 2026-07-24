import { useEffect } from 'react'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · SEDA` : 'SEDA'
    return () => {
      document.title = 'SEDA'
    }
  }, [title])
}