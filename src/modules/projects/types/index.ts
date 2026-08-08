export interface ProjectTask {
  id: number
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  order: number
  assignee: { id: number; name: string } | null
}

export interface KanbanColumn {
  id: number
  name: string
  order: number
  tasks: ProjectTask[]
}

export interface Milestone {
  id: number
  title: string
  due_date: string | null
  status: 'pending' | 'reached' | 'missed'
}

export interface Project {
  id: number
  name: string
  description: string | null
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  start_date: string | null
  end_date: string | null
  budget: number | null
  client: { id: number; name: string } | null
  manager: { id: number; name: string } | null
  columns?: KanbanColumn[]
  milestones?: Milestone[]
  deliverables?: Deliverable[]
}

export interface Deliverable {
  id: number
  title: string
  status: 'pending' | 'delivered'
  delivered_at: string | null
}

