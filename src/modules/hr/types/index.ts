export interface Skill {
  id: number
  name: string
  category: string | null
  level?: number
}

export interface Objective {
  id: number
  title: string
  target_date: string | null
  progress: number
  status: 'in_progress' | 'achieved' | 'missed'
}

export interface Kpi {
  id: number
  name: string
  target_value: number | null
  actual_value: number | null
  unit: string | null
  period: 'month' | 'quarter' | 'year'
  period_date: string
}

export interface Mission {
  id: number
  title: string
  status: 'planned' | 'in_progress' | 'completed'
  start_date: string | null
  end_date: string | null
  project: { id: number; name: string } | null
}

export interface Collaborator {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  position: string | null
  department: string | null
  hire_date: string | null
  is_active: boolean
  skills?: Skill[]
  objectives?: Objective[]
  missions?: Mission[]
  kpis?: Kpi[]
}

export interface LinkableUser {
  id: number
  name: string
  email: string
}
