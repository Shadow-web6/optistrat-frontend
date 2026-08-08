export interface Interaction {
  id: number
  type: 'call' | 'email' | 'meeting' | 'note'
  content: string
  reminder_at: string | null
  author: { id: number; name: string }
  created_at: string
}

export interface Prospect {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: 'prospect' | 'client'
  assigned_to?: { id: number; name: string } | null
  interactions?: Interaction[]
}

export interface TeamMember {
  id: number
  name: string
}

export interface PipelineStage {
  id: number
  name: string
  order: number
}

export interface Opportunity {
  id: number
  title: string
  estimated_value: number | null
  expected_close_date: string | null
  pipeline_stage_id: number
  prospect: { id: number; name: string }
}