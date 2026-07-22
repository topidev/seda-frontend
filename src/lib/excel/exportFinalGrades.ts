import * as XLSX from 'xlsx'
import { ExportFinalGradesParams } from "@/types";

export function exportFinalGrades({
  subjectName,
  groupName,
  academicTermName,
  students,
  periodsCount
}: ExportFinalGradesParams) {
  const workbook = XLSX.utils.book_new()
  const rows: (string | number | null)[][] = []

  console.log('Students en export:', students)


  rows.push([`${subjectName} - Calificaciones Finales`])
  rows.push([`${groupName} · ${academicTermName}`])
  rows.push([])

  const header = ['Alumno']
  for (let i = 1; i <= periodsCount; i++) {
    header.push(`B${i}`)
  }
  header.push('Promedio Final')
  rows.push(header)

  students.forEach(s => {
    if (!s.student) return

    const row: (string | number | null)[] = [
      `${s.student.name} ${s.student.firstLastName} ${s.student.secondLastName ?? ''}`.trim(),
    ]

    s.grades.forEach(grade => {
      const score = grade.finalScore ?? grade.calculatedScore
      row.push(score)
    })

    row.push(s.average)
    rows.push(row)
  })

  rows.push([])

  rows.push(['* Las calificaciones editadas manualmente muestran el valor final ajustado'])

  const worksheet = XLSX.utils.aoa_to_sheet(rows)

  const cols = [{ wch: 35 }]
  for (let i = 0; i < periodsCount; i++) {
    cols.push({ wch: 8 })
  }
  cols.push({ wch: 15 })
  worksheet['!cols'] = cols

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones Finales')

  const fileName = `${subjectName.replace(/\s+/g, '_')}_${groupName.replace(/\s+/g, '_')}_${academicTermName}_Final.xlsx`

  XLSX.writeFile(workbook, fileName)

}