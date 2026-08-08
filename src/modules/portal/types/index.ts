export interface ClientRequest {
  id: number
  subject: string
  message: string
  reply: string | null
  status: 'open' | 'in_progress' | 'closed'
  prospect: { id: number; name: string }
  created_by: { id: number; name: string }
  handled_by: { id: number; name: string } | null
  created_at: string
}