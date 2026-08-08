export interface AppEvent {
  id: number
  title: string
  description: string | null
  location: string | null
  start_at: string
  end_at: string | null
  registrations_count: number
  is_registered: boolean
}