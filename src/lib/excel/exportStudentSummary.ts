import * as XLSX from 'xlsx'
import { ExportStudentSummaryParams } from "@/types";

export function exportStudentSummary({
  studentName,
  subjectName,
  groupName,
  academicTermName,
  periods
}: ExportStudentSummaryParams) {

  const workbook = XLSX.utils.book_new()

  periods.forEach(period => {
    const rows: (string | number | null)[][] = []

    rows.push([`${subjectName} - Bimestre ${period.number}`])
    rows.push([`${studentName} · ${groupName} · ${academicTermName}`])
    rows.push([])

    rows.push(['Actividad', 'Categoría', 'Calificación', 'Valor Máximo'])

    if (period.activities.length == 0) {
      rows.push([`Sin actividades registradas`, '', '', ''])
    }
    else {
      period.activities.forEach(activity => {
        const score = activity.didNotSubmit ?
          'No entregó' :
          activity.score !== null ?
            activity.score :
            'Sin calificar'

        rows.push([
          activity.title,
          activity.categoryName,
          score,
          activity.maxScore
        ])
      })
    }

    rows.push([])

    rows.push(['ASISTENCIAS', '', '', ''])

    const presentes = period.attendance.filter(a => a.status === 'PRESENT')
    const ausentes = period.attendance.filter(a => a.status === 'ABSENT')
    const tardanzas = period.attendance.filter(a => a.status === 'LATE')
    const justificadas = period.attendance.filter(a => a.status === 'EXCUSED')

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })

    rows.push(['Presentes', presentes.length, '', ''])

    rows.push(['Ausencias', ausentes.length, '', ''])
    ausentes.forEach(a => {
      rows.push([`· ${formatDate(a.date)}`, '', '', ''])
    })

    rows.push(['Tardanzas', tardanzas.length, '', ''])
    tardanzas.forEach(a => {
      rows.push([`· ${formatDate(a.date)}`, '', '', ''])
    })

    rows.push(['Justificadas', justificadas.length, '', ''])
    justificadas.forEach(a => {
      rows.push([`· ${formatDate(a.date)}`, '', '', ''])
    })

    rows.push([])

    if (period.finalGrade) {
      rows.push(['Calificación calculada', period.finalGrade.calculatedScore, '', ''])
      if (period.finalGrade.finalScore !== null) {
        rows.push(['Calificación final (editada)', period.finalGrade.finalScore, '', ''])
      }
    }
    else {
      rows.push(['Sin calificación final', '', '', ''])
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows)


    worksheet['!cols'] = [
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, `Bimestre ${period.number}`)
  })

  const fileName = `${studentName.replace(/\s+/g, '_')}_${subjectName.replace(/\s+/g, '_')}_${academicTermName}.xlsx`
  XLSX.writeFile(workbook, fileName)

}