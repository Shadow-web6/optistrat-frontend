export interface DashboardStats {
  crm?: { prospects: number; clients: number }
  osd?: { diagnostics_completed: number; average_score: number }
  hr?: { collaborators: number }
  projects?: { active: number; total: number; open_tasks: number }
  ged?: { documents: number }
  finance?: { invoiced: number; paid: number; expenses: number }
  academy: { courses: number }
  events: { upcoming: number }
}