import Dexie, { Entity, type EntityTable } from 'dexie'

export interface PendingAttendence {
    id?: string // incremento local
    subjectTermGroupId: string
    date: string
    records: {
        studentId: string;
        status: string
    } []
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
    } []
    createdAt: string
    attepmts: number
}


class SedaDatabase extends Dexie {
    pendingAttendance!: EntityTable<PendingAttendence, 'id'>
    pendingGrades!: EntityTable<PendingGrade, 'id'>

    constructor() {
        super('sed-offline')

        this.version(1).stores({
            pendingAttendance: '++id, subjectTermGroupId, date, createdAt',
            pendingGrades: '++id, activityId, createdAt', 
        })
    }
}

export const db = new SedaDatabase()