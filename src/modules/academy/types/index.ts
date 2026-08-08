export interface Enrollment {
  id: number
  status: 'enrolled' | 'completed'
  collaborator: { id: number; name: string }
}

export interface Course {
  id: number
  title: string
  description: string | null
  duration_hours: number | null
  enrollments_count: number
  enrollments: Enrollment[]
}