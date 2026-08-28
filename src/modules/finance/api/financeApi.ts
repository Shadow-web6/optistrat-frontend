import { api } from '@/shared/lib/api'
import type { Invoice, Expense } from '../types'

export const financeApi = {
  listInvoices: async () => {
    const { data } = await api.get<{ data: Invoice[] }>('/finance/invoices')
    return data.data
  },

  createInvoice: async (payload: {
    invoice_number: string
    amount: number
    issue_date: string
    due_date?: string
    client_id?: number
    project_id?: number
  }) => {
    const { data } = await api.post<{ data: Invoice }>('/finance/invoices', payload)
    return data.data
  },

  updateInvoice: async (id: number, payload: Partial<{
    invoice_number: string
    amount: number
    issue_date: string
    due_date: string | null
    status: Invoice['status']
  }>) => {
    const { data } = await api.patch<{ data: Invoice }>(`/finance/invoices/${id}`, payload)
    return data.data
  },

  markPaid: async (invoiceId: number) => {
    const { data } = await api.patch<{ data: Invoice }>(`/finance/invoices/${invoiceId}`, {
      status: 'paid',
      paid_at: new Date().toISOString().slice(0, 10),
    })
    return data.data
  },

  cancelInvoice: async (invoiceId: number) => {
    const { data } = await api.patch<{ data: Invoice }>(`/finance/invoices/${invoiceId}`, {
      status: 'cancelled',
    })
    return data.data
  },

  listExpenses: async () => {
    const { data } = await api.get<{ data: Expense[] }>('/finance/expenses')
    return data.data
  },

  createExpense: async (payload: {
    category: string
    description?: string
    amount: number
    expense_date: string
    project_id?: number
  }) => {
    const { data } = await api.post<{ data: Expense }>('/finance/expenses', payload)
    return data.data
  },

  updateExpense: async (id: number, payload: Partial<{
    category: string
    description: string | null
    amount: number
    expense_date: string
    project_id: number | null
  }>) => {
    const { data } = await api.patch<{ data: Expense }>(`/finance/expenses/${id}`, payload)
    return data.data
  },

  deleteExpense: async (id: number) => {
    await api.delete(`/finance/expenses/${id}`)
  },
}