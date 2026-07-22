'use client'

import BackButton from "@/components/BackButton"
import ProtectedPage from "@/components/ProtectedPage"
import Spinner from "@/components/Spinner"
import { useClassDetail, useFinalGrades } from "@/hooks/useClassroom"
import { exportFinalGrades } from "@/lib/excel/exportFinalGrades"
import { Download } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function FinalGradesPage() {
	const params = useParams()
	const subjectTermGroupId = params.id as string

	const { data: cls } = useClassDetail(subjectTermGroupId)
	const { data: finalGrades, isLoading } = useFinalGrades(subjectTermGroupId)

	const getScoreColor = (score: number | null) => {
		if (score == null) return ('var(--color-next-disabled')
		if (score >= 9) return 'var(--color-success)'
		if (score >= 7) return 'var(--color-info)'
		if (score >= 6) return 'var(--color-warning)'
		return 'var(--color-error)'
	}

	const [isExporting, setIsExporting] = useState(false)

	const handleExport = () => {
		if (!finalGrades || !cls) return
		setIsExporting(true)

		try {
			exportFinalGrades({
				subjectName: cls.subject.name,
				groupName: `${cls.group.grade}°${cls.group.letter}`,
				academicTermName: cls.academicTerm.name,
				students: finalGrades.students,
				periodsCount: finalGrades.periods.length
			})
		}
		catch {
			toast.error('Error al generar el archivo')
		}
		finally {
			setIsExporting(false)
		}
	}

	console.log('Calificacion Final: ', finalGrades)

	if (isLoading) return (
		<ProtectedPage>
			<Spinner />
		</ProtectedPage>
	)

	if (!finalGrades) return (
		<ProtectedPage>
			<div
				className="rounded-2xl p-12 flex flex-col items-center gap-3 mt-6"
				style={{
					backgroundColor: 'var(--color-bg-elevated)',
					border: '1px solid var(--color-border)',
				}}
			>
				<p style={{ color: 'var(--color-text-secondary)' }}>
					No hay calificaciones finales disponibles
				</p>
			</div>
		</ProtectedPage>
	)

	return (
		<ProtectedPage>
			{isLoading && <Spinner />}

			<div className="flex items-center gap-3 mb-6">
				<BackButton href={`/dashboard/classroom/${subjectTermGroupId}`} />
				<div className="flex-1">
					<h1
						className="text-xl md:text-2xl font-semibold"
						style={{
							color: 'var(--color-text-primary)',
							fontFamily: 'var(--font-geist)',
						}}
					>
						Calificaciones finales
					</h1>
					<p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
						{cls?.subject.name} · {cls?.group.grade}°{cls?.group.letter} · {cls?.academicTerm.name}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleExport}
						disabled={isExporting || !finalGrades}
						className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
						style={{
							backgroundColor: 'var(--color-bg-elevated)',
							border: '1px solid var(--color-border)',
							color: isExporting ? 'var(--color-text-disabled)' : 'var(--color-text-secondary)',
							cursor: isExporting ? 'not-allowed' : 'pointer',
						}}
						onMouseEnter={e => {
							if (!isExporting) {
								e.currentTarget.style.borderColor = 'var(--color-primary)'
								e.currentTarget.style.color = 'var(--color-primary)'
							}
						}}
						onMouseLeave={e => {
							if (!isExporting) {
								e.currentTarget.style.borderColor = 'var(--color-border)'
								e.currentTarget.style.color = 'var(--color-text-secondary)'
							}
						}}
					>
						<Download size={14} />
						{isExporting ? 'Generando...' : 'Exportar Excel'}
					</button>
				</div>
			</div>


			{!isLoading && finalGrades && (
				<div
					className="rounded-2xl overflow-hidden"
					style={{ border: '1px solid var(--color-border)' }}
				>
					<div className="overflow-x-auto">
						<table className="w-full" style={{ minWidth: '500px' }}>
							{/* Header */}
							<thead>
								<tr
									style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
								>
									<th
										className="text-left p-2 md:px-4 md:py-3 text-xs font-medium uppercase tracking-wider"
										style={{
											color: 'var(--color-text-disabled)',
											position: 'sticky',
											left: 0,
											backgroundColor: 'var(--color-bg-tertiary)',
											minWidth: '140px',
											zIndex: 1,
										}}
									>
										Alumno
									</th>
									{finalGrades.periods.map(period => (
										<th
											key={period.id}
											className="text-center p-2 md:px-4 md:py-3 text-xs font-medium uppercase tracking-wider"
											style={{
												color: 'var(--color-text-disabled)',
												minWidth: '60px',
											}}
										>
											B{period.number}
										</th>
									))}
									<th
										className="text-center p-2 md:px-4 md:py-3 text-xs font-medium uppercase tracking-wider"
										style={{
											color: 'var(--color-text-disabled)',
											minWidth: '70px',
										}}
									>
										Final
									</th>
								</tr>
							</thead>

							{/* Body */}
							<tbody>
								{finalGrades?.students?.map((student, index) => {
									const isLast = index === finalGrades.students.length - 1
									const rowBg = index % 2 === 0
										? 'var(--color-bg-elevated)'
										: 'var(--color-bg-secondary)'

									return (
										<tr
											key={student?.student?.id}
											style={{
												borderBottom: isLast ? 'none' : '1px solid var(--color-divider)',
											}}
										>
											{/* Nombre - sticky */}
											<td
												className="p-2 md:px-4 md:py-3"
												style={{
													position: 'sticky',
													left: 0,
													backgroundColor: rowBg,
													zIndex: 1,
												}}
											>
												<div className="flex items-center gap-2">
													<span
														className="text-sm"
														style={{ color: 'var(--color-text-primary)' }}
													>
														{student?.student?.firstLastName} {student?.student?.name}
													</span>
												</div>
											</td>

											{/* Calificaciones por bimestre */}
											{student?.grades?.map(grade => {
												const score = grade.finalScore ?? grade.calculatedScore
												return (
													<td
														key={grade.periodId}
														className="text-center p-2 md:px-4 md:py-3"
														style={{ backgroundColor: rowBg }}
													>
														<span
															className="text-sm font-medium"
															style={{ color: getScoreColor(score) }}
														>
															{score ?? '-'}
														</span>
													</td>
												)
											})}

											{/* Promedio final */}
											<td
												className="text-center p-2 md:px-4 md:py-3"
												style={{ backgroundColor: rowBg }}
											>
												<span
													className="text-sm font-semibold"
													style={{
														color: getScoreColor(student.average),
														fontFamily: 'var(--font-geist)',
													}}
												>
													{student.average ?? '-'}
												</span>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Leyenda */}
			{/* {finalGrades && (
					<div className="flex gap-4 mt-4 flex-wrap">
						{[
							{ label: '9-10', color: 'var(--color-success)' },
							{ label: '7-8.9', color: 'var(--color-info)' },
							{ label: '6-6.9', color: 'var(--color-warning)' },
							{ label: '< 6', color: 'var(--color-error)' },
						].map(item => (
							<div key={item.label} className="flex items-center gap-1.5">
								<div
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: item.color }}
								/>
								<span
									className="text-xs"
									style={{ color: 'var(--color-text-disabled)' }}
								>
									{item.label}
								</span>
							</div>
						))}
					</div>
				)} */}
		</ProtectedPage>
	)
}