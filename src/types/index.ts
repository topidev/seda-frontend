// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export interface Teacher {
  id: string
  email: string
  name: string
  lastName: string
  photo: string | null
  role: string
  active?: boolean
  createdAt?: string
}

// ─────────────────────────────────────────
// SCHOOLS
// ─────────────────────────────────────────

export interface AcademicTerm {
  id: string
  name: string
  startDate: string
  endDate: string
  active: boolean
  createdAt?: string
  periods?: Period[]
}

export interface Period {
  id: string
  number: number
  startDate: string
  endDate: string
  closed: boolean
}

export interface School {
  id: string
  name: string
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
  level: 'SECONDARY'
  active: boolean
  academicTerms: AcademicTerm[]
  _count: { groups: number }
}

// ─────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────

export interface GradeCategory {
  id: string
  subjectId: string
  name: string
  percentage: number
}

export interface Subject {
  id: string
  name: string
  active: boolean
  gradeCategories: GradeCategory[]
  _count: { subjectTermGroups: number }
}

// ─────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────

export interface SubjectTermGroup {
  id: string
  subjectId?: string
  subject: Subject
  groupId?: string
  group: Group
  academicTermId?: string
  academicTerm: AcademicTerm
  active?: boolean
  _count: { activities: number }
}

export interface Group {
  id: string
  schoolId: string
  grade: string
  letter: string
  active: boolean
  school: Pick<School, 'id' | 'name' | 'shift'>
  subjectTermGroups: {
    id: string
    subjectId: string
    subject: Pick<Subject, 'id' | 'name'>
  }[]
  studentGroupTerms: {
    id: string
    studentId: string
    student: Pick<Student, 'id' | 'name' | 'firstLastName' | 'secondLastName'>
  }[]
}

// ─────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────

export interface Student {
  id: string
  name: string
  firstLastName: string
  secondLastName: string | null
  birthDate: string | null
  tutorName: string | null
  tutorPhone: string | null
  deletedAt: string | null
  groupTerms: {
    id: string
    groupId: string
    academicTermId: string
    group: Pick<Group, 'id' | 'grade' | 'letter'>
  }[]
}

// ─────────────────────────────────────────
// CLASSROOM
// ─────────────────────────────────────────

export interface Activity {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  maxScore: number
  createdAt: string
  category: GradeCategory
  grades: Grade[]
}

export interface Grade {
  id: string
  studentId: string
  score: number | null
  didNotSubmit: boolean
}

export interface FinalGrade {
  id: string
  studentId: string
  calculatedScore: number
  finalScore: number | null
  overrideReason: string | null
  overrideAt: string | null
  closed: boolean
  student: Pick<Student, 'id' | 'name' | 'firstLastName' | 'secondLastName'>
}

export interface AttendanceRecord {
  id: string
  studentId: string
  subjectTermGroupId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
}

// ─────────────────────────────────────────
// DTOs (lo que se manda al backend)
// ─────────────────────────────────────────

export interface CreateSchoolDto {
  name: string
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING'
  level: 'SECONDARY'
}

export interface CreateTermDto {
  name: string
  startDate: string
  endDate: string
}

export interface CreateSubjectDto {
  name: string
}

export interface CreateGradeCategoryDto {
  name: string
  percentage: number
}

export interface CreateGroupDto {
  schoolId: string
  grade: string
  letter: string
  academicTermId: string
  subjectIds?: string[]
}

export interface CreateStudentDto {
  name: string
  firstLastName: string
  secondLastName?: string
  birthDate?: string
  tutorName?: string
  tutorPhone?: string
  groupId: string
  academicTermId: string
}

export interface CreateActivityDto {
  title: string
  description?: string
  categoryId: string
  dueDate?: string
  maxScore?: number
}

export interface StudentGradeDto {
  studentId: string
  score?: number
  didNotSubmit?: boolean
}