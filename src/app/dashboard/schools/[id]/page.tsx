'use client'

import ProtectedPage from "@/components/ProtectedPage"
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { useRequiredAuth } from "@/hooks/useAuthGuard"
import { shiftLabel, useCreateTerm, useSchool } from "@/hooks/useSchools"
import { Link, ArrowLeft, Plus, Calendar } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

export default function SchooldDetailPage() {
    const params = useParams()
    const schoolId = params.id as string

    const { data: school, isLoading } = useSchool(schoolId)
    const { mutate: createTerm, isPending, isError } = useCreateTerm(schoolId)

    const [open, setOpen] = useState(false)
    const [termName, setTermName] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    const handleSubmit = () => {
        if(!termName.trim() || !startDate || !endDate) return

        createTerm(
            { name: termName, startDate, endDate },
            {
                onSuccess: () => {
                    setOpen(false)
                    setTermName('')
                    setStartDate('')
                    setEndDate('')
                },
            },
        )
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-Mx', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <ProtectedPage>
        <main
        className="min-h-screen p-8"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
        >
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard/schools">
                <button
                className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
                >
                <ArrowLeft size={16} />
                </button>
            </Link>

            <div>
                <h1
                className="text-2xl font-semibold"
                style={{
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-geist)',
                }}
                >
                {isLoading ? '...' : school?.name}
                </h1>
                {school && (
                <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {shiftLabel[school.shift]}
                </p>
                )}
            </div>
            </div>

            {/* Sección ciclos escolares */}
            <div className="flex items-center justify-between mb-4">
            <h2
                className="text-lg font-medium"
                style={{ color: 'var(--color-text-primary)' }}
            >
                Ciclos escolares
            </h2>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
                e.currentTarget.style.color = 'var(--color-primary)'
                }}
                onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)'
                e.currentTarget.style.color = 'var(--color-text-secondary)'
                }}
            >
                <Plus size={14} />
                Nuevo ciclo
            </button>
            </div>

            {/* Loading */}
            {isLoading && (
            <div className="flex justify-center py-12">
                <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-primary)' }}
                />
            </div>
            )}

            {/* Lista vacía */}
            {!isLoading && school?.academicTerms.length === 0 && (
            <div
                className="rounded-2xl p-12 flex flex-col items-center gap-4"
                style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                }}
            >
                <Calendar
                size={48}
                style={{ color: 'var(--color-text-disabled)' }}
                />
                <p style={{ color: 'var(--color-text-secondary)' }}>
                Aún no tienes ciclos escolares
                </p>
                <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 rounded-xl cursor-pointer"
                style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                }}
                >
                Crear primer ciclo
                </button>
            </div>
            )}

            {/* Lista de ciclos */}
            {!isLoading && school && school.academicTerms.length > 0 && (
            <div className="flex flex-col gap-3">
                {school.academicTerms.map((term) => (
                <div
                    key={term.id}
                    className="rounded-2xl p-5"
                    style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    }}
                >
                    {/* Header del ciclo */}
                    <div className="flex items-center justify-between mb-4">
                    <div>
                        <p
                        className="font-medium"
                        style={{ color: 'var(--color-text-primary)' }}
                        >
                        {term.name}
                        </p>
                        <p
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                        >
                        {formatDate(term.startDate)} → {formatDate(term.endDate)}
                        </p>
                    </div>
                    <span
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                        backgroundColor: term.active
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'var(--color-bg-tertiary)',
                        color: term.active
                            ? 'var(--color-success)'
                            : 'var(--color-text-disabled)',
                        }}
                    >
                        {term.active ? 'Activo' : 'Cerrado'}
                    </span>
                    </div>

                    {/* Bimestres */}
                    <div className="flex flex-col gap-2">
                    {term.periods?.map((period) => (
                        <div
                        key={period.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                        >
                        <div className="flex items-center gap-3">
                            <span
                            className="text-xs font-medium w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                            }}
                            >
                            {period.number}
                            </span>
                            <span
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            >
                            Bimestre {period.number}
                            </span>
                        </div>
                        <span
                            className="text-xs"
                            style={{ color: 'var(--color-text-disabled)' }}
                        >
                            {formatDate(period.startDate)} → {formatDate(period.endDate)}
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>

        {/* Modal nuevo ciclo */}
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
            style={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
            }}
            >
            <DialogHeader>
                <DialogTitle
                style={{
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-geist)',
                }}
                >
                Nuevo ciclo escolar
                </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-5 mt-2">
                {/* Nombre */}
                <div className="flex flex-col gap-2">
                <label
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Nombre del ciclo
                </label>
                <input
                    type="text"
                    value={termName}
                    onChange={e => setTermName(e.target.value)}
                    placeholder="Ej. 2024-2025"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    }}
                    onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                />
                </div>

                {/* Fechas */}
                <div className="flex gap-3">
                <div className="flex flex-col gap-2 flex-1">
                    <label
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                    >
                    Fecha inicio
                    </label>
                    <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        colorScheme: 'dark',
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                    />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                    <label
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text-secondary)' }}
                    >
                    Fecha fin
                    </label>
                    <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        colorScheme: 'dark',
                    }}
                    onFocus={e => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onBlur={e => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                    />
                </div>
                </div>

                {/* Error */}
                {isError && (
                <p
                    className="text-sm"
                    style={{ color: 'var(--color-error)' }}
                >
                    Ocurrió un error al crear el ciclo. Intenta de nuevo.
                </p>
                )}

                {/* Botón submit */}
                <button
                onClick={handleSubmit}
                disabled={isPending || !termName.trim() || !startDate || !endDate}
                className="w-full py-3 rounded-xl font-medium transition-colors"
                style={{
                    backgroundColor:
                    isPending || !termName.trim() || !startDate || !endDate
                        ? 'var(--color-text-disabled)'
                        : 'var(--color-primary)',
                    color: 'white',
                    cursor:
                    isPending || !termName.trim() || !startDate || !endDate
                        ? 'not-allowed'
                        : 'pointer',
                }}
                >
                {isPending ? 'Creando...' : 'Crear ciclo'}
                </button>
            </div>
            </DialogContent>
        </Dialog>
    </main>
    </ProtectedPage>
  )

}