import Dexie, { type EntityTable } from 'dexie'

export interface PendingAttendence {
    id?: string // incremento local
    subjectTermGroupId: string
    date: string
    records: {
        studentId: string;
        status: string
    }[]
    createdAt: string
    attempts: number //intentos de sincornización
}

export interface PendingGrade {
    id?: number
    activityId: string
    grades: {
        studentId: string;
        score: number;
        didNotSubmit: boolean
    }[]
    createdAt: string
    attepmts: number
}

export interface CachedClass {
    id: string
    data: any
    cachedAt: string
}


class SedaDatabase extends Dexie {
    pendingAttendance!: EntityTable<PendingAttendence, 'id'>
    pendingGrades!: EntityTable<PendingGrade, 'id'>
    cachedClasses!: EntityTable<CachedClass, 'id'>

    constructor() {
        super('sed-offline')

        this.version(1).stores({
            pendingAttendance: '++id, subjectTermGroupId, date, createdAt',
            pendingGrades: '++id, activityId, createdAt',
        })

        this.version(2).stores({
            pendingAttendance: '++id, subjectTermGroupId, date, createdAt',
            pendingGrades: '++id, activityId, createdAt',
            cachedClasses: 'id, cachedAt'
        })
    }
}

export const db = new SedaDatabase()