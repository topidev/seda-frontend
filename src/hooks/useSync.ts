import api from "@/lib/api/axios"
import { db } from "@/lib/db"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof window !== 'undefined' ? navigator.onLine : true
    )

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return() => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

export function usePendingCount() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const updateCount = async () => {
            const attendanceCount = await db.pendingAttendance.count()
            const gradesCount = await db.pendingGrades.count()
            setCount(attendanceCount + gradesCount)
        }

        updateCount()

        const interval = setInterval(updateCount, 5000)
        return () => clearInterval(interval)
    }, [])
    
    return count
}

export function useSync() {
	const isOnline = useOnlineStatus()

	const syncAttendance = useCallback(async () => {
		const pending = await db.pendingAttendance.toArray()
		if (pending.length === 0) return

		let synced = 0
		let failed = 0

		for (const record of pending) {
			try {
				await api.post(
					`/classroom/${record.subjectTermGroupId}/attendance`,
					{ date: record.date, records: record.records }
				)
				await db.pendingAttendance.delete(record.id!)
				synced++
			} catch {
				await db.pendingAttendance.update(record.id!, {
						attempts: record.attempts + 1
				})
				failed++
			}
		}

		if(synced > 0) {
			toast.success(`${synced} lista${synced > 1 ? 's' : ''} sincronizada${synced > 1 ? 's' : ''}`)
		}
		if (failed > 0) {
      toast.error(`${failed} lista${failed > 1 ? 's' : ''} no pudieron sincronizarse`)
    }
	}, [])

	const syncGrades = useCallback(async () => {
		const pending = await db.pendingGrades.toArray()
		if (pending.length === 0) return

		let synced = 0

		for(const record of pending) {
			try {
				await api.post(
					`/classroom/activities/${record.activityId}/grades`,
					{ grades: record.grades }
				)
				await db.pendingGrades.delete(record.id!)
				synced++
			} catch {
				await db.pendingGrades.update(record.id!, {
					attepmts: record.attepmts + 1,
				})
			}
		}

		if (synced > 0) {
			toast.success(`${synced} calificación${synced > 1 ? 'es' : ''} sincronizada${synced > 1 ? 's' : ''}`)
		}
	}, [])

	const syncAll = useCallback(async () => {
		await Promise.all([syncAttendance(), syncGrades()])
	}, [syncAttendance, syncGrades])

	useEffect(() => {
		if(isOnline) {
			syncAll()
		}
	}, [isOnline, syncAll])

	return { isOnline, syncAll }
}