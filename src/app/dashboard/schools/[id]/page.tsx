'use client'

import AppButton from "@/components/AppButton"
import AppInput from "@/components/AppInput"
import BackButton from "@/components/BackButton"
import ConfirmDialog from "@/components/ConfirmDialog"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { Dialog, DialogTitle, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { shiftLabel, useCreateTerm, useSchool } from "@/hooks/useSchools"
import api from "@/lib/api/axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Calendar, Trash2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const createTermSchema = z.object({
	name: z.string().min(2, 'Ej. 2024-2025'),
	startDate: z.string().min(1, 'Selecciona una fecha de inicio'),
	endDate: z.string().min(1, 'Selecciona una fecha de fin')
}).refine(data => data.endDate > data.startDate, {
	message: 'La fecha de fin debe ser posterior a la de inicio',
	path: ['endDate']
})

type CreateTermFormData = z.infer<typeof createTermSchema>

export default function SchooldDetailPage() {
	const params = useParams()
	const schoolId = params.id as string
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data: school, isLoading } = useSchool(schoolId)
	const { mutate: createTerm, isPending, isError } = useCreateTerm(schoolId)

	const [open, setOpen] = useState(false)
	const [openConfirm, setOpenConfirm] = useState(false)
	
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset
	} = useForm<CreateTermFormData>({
		resolver: zodResolver(createTermSchema),
		defaultValues: {
			name: '',
			startDate: '',
			endDate: ''
		}
	})

	const { mutate: removeSchool } = useMutation({
		mutationFn: async () => {
			await api.delete(`/schools/${schoolId}`)
		},
		onSuccess: () => {
			toast.success('Escuela Eliminada')
			queryClient.invalidateQueries({ queryKey: ['schools'] }) //modificar queryKey
			router.replace(`/dashboard/schools`)
		},
		onError: () => {
			toast.error('Error al eliminar la escuela')
		}
	})

	const onSubmit = (data: CreateTermFormData) => {
		createTerm(
			data,
			{
				onSuccess: () => {
					setOpen(false)
					reset()
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

	if (isLoading) {
    return (
      <ProtectedPage>
        <Spinner />
      </ProtectedPage>
    )
  }

	return (
		<ProtectedPage>
			{/* Header */}
			<div className="flex items-center gap-3 mb-8">
				<BackButton href="/dashboard/schools" />

				{school && (
					<div className='flex items-center justify-between w-full'>
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
							<p
								className="text-sm"
								style={{ color: 'var(--color-text-secondary)' }}
							>
								{shiftLabel[school.shift]}
							</p>
						</div>
						<div>
							<button
								onClick={() => setOpenConfirm(true)}
								className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
								style={{
									backgroundColor: 'var(--color-bg-elevated)',
									border: '1px solid var(--color-border)',
									color: 'var(--color-text-secondary)',
								}}
								onMouseEnter={e => {
									e.currentTarget.style.borderColor = 'var(--color-error)'
									e.currentTarget.style.color = 'var(--color-error)'
								}}
								onMouseLeave={e => {
									e.currentTarget.style.borderColor = 'var(--color-border)'
									e.currentTarget.style.color = 'var(--color-text-secondary)'
								}}
							>
								<Trash2 size={15} />
							</button>
						</div>
					</div>
				)}
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
				<Spinner fullScreen />
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

			{/* Modal nuevo ciclo */}
			<Dialog 
				open={open} 
				onOpenChange={
					(val) => { 
						setOpen(val)
						if(!val) reset()
					}
				}
			>
				<DialogContent
					className="flex flex-col"
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

					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-2">
						{/* Nombre */}
						<div className="flex flex-col gap-2 w-full">
							<label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Nombre del ciclo
              </label>
              <input
                {...register('name')}
                placeholder="Ej. 2024-2025"
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: `1px solid ${errors.name ? 'var(--color-error)' : 'var(--color-border)'}`,
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = errors.name
                    ? 'var(--color-error)'
                    : 'var(--color-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.name
                    ? 'var(--color-error)'
                    : 'var(--color-border)'
                }}
              />
							{errors.name && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.name.message}
                </p>
              )}
						</div>

						{/* Fechas */}
						<div className="flex flex-col gap-3 md:flex-row">
							{[
								{ field: 'startDate' as const, label: 'Fecha inicio' },
								{ field: 'endDate' as const, label: 'Fecha fin' },
							].map(({ field, label }) => (
								<div key={field} className="flex flex-col gap-2 flex-1">
									<label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {label}
                  </label>
                  <input
                    {...register(field)}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: `1px solid ${errors[field] ? 'var(--color-error)' : 'var(--color-border)'}`,
                      color: 'var(--color-text-primary)',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = errors[field]
                        ? 'var(--color-error)'
                        : 'var(--color-primary)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = errors[field]
                        ? 'var(--color-error)'
                        : 'var(--color-border)'
                    }}
                  />
                  {errors[field] && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      {errors[field]?.message}
                    </p>
                  )}
								</div>
							))}
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
						<AppButton
							fullWidth
							isPending={isPending}
							pendingLabel="Creando..."
						>
							Crear ciclo
						</AppButton>
					</form>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={openConfirm}
				onOpenChange={setOpenConfirm}
				title="Eliminar Escuela"
				description={`¿Seguro que quieres inactivar a ${school?.name}?\n Su historial se conservará.`}
				confirmLabel="Inactivar"
				onConfirm={() => {
					removeSchool()
					setOpenConfirm(false)
				}}
			/>
		</ProtectedPage >
	)

}