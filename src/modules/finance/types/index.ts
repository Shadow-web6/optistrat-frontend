export interface Invoice {
  id: number
  invoice_number: string
  amount: number
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string | null
  paid_at: string | null
  project: { id: number; name: string } | null
  client: { id: number; name: string } | null
}

export interface Expense {
  id: number
  category: string
  description: string | null
  amount: number
  expense_date: string
  project: { id: number; name: string } | null
  created_by: { id: number; name: string }
}