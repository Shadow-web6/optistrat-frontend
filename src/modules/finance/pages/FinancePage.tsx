import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '../api/financeApi'
import { crmApi } from '@/modules/crm/api/crmApi'
import { projectsApi } from '@/modules/projects/api/projectsApi'
import type { Expense } from '../types'

const STATUS_LABEL: Record<string, string> = {
  draft: 'Brouillon', sent: 'Envoyée', paid: 'Payée', overdue: 'En retard', cancelled: 'Annulée',
}
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600', sent: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700', overdue: 'bg-red-50 text-red-700',
  cancelled: 'bg-red-100 text-red-500 line-through',
}

export default function FinancePage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'invoices' | 'expenses'>('invoices')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)
  const [editExpenseForm, setEditExpenseForm] = useState({ category: '', description: '', amount: '', expense_date: '' })

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: '', amount: '', issue_date: '', client_id: '', project_id: '',
  })
  const [expenseForm, setExpenseForm] = useState({
    category: '', description: '', amount: '', expense_date: '', project_id: '',
  })

  const { data: invoices, isLoading: loadingInvoices } = useQuery({
    queryKey: ['finance', 'invoices'], queryFn: financeApi.listInvoices,
  })
  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: ['finance', 'expenses'], queryFn: financeApi.listExpenses,
  })
  const { data: clients } = useQuery({
    queryKey: ['crm', 'prospects', 'client'], queryFn: () => crmApi.list('client'),
  })
  const { data: projects } = useQuery({
    queryKey: ['projects'], queryFn: projectsApi.list,
  })

  const markPaidMutation = useMutation({
    mutationFn: (id: number) => financeApi.markPaid(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  })

  const cancelInvoiceMutation = useMutation({
    mutationFn: (id: number) => financeApi.cancelInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] }),
  })

  const createInvoiceMutation = useMutation({
    mutationFn: () => financeApi.createInvoice({
      invoice_number: invoiceForm.invoice_number,
      amount: Number(invoiceForm.amount),
      issue_date: invoiceForm.issue_date,
      client_id: invoiceForm.client_id ? Number(invoiceForm.client_id) : undefined,
      project_id: invoiceForm.project_id ? Number(invoiceForm.project_id) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] })
      setInvoiceForm({ invoice_number: '', amount: '', issue_date: '', client_id: '', project_id: '' })
      setShowInvoiceForm(false)
    },
  })

  const createExpenseMutation = useMutation({
    mutationFn: () => financeApi.createExpense({
      category: expenseForm.category,
      description: expenseForm.description || undefined,
      amount: Number(expenseForm.amount),
      expense_date: expenseForm.expense_date,
      project_id: expenseForm.project_id ? Number(expenseForm.project_id) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] })
      setExpenseForm({ category: '', description: '', amount: '', expense_date: '', project_id: '' })
      setShowExpenseForm(false)
    },
  })

  const updateExpenseMutation = useMutation({
    mutationFn: (id: number) => financeApi.updateExpense(id, {
      category: editExpenseForm.category,
      description: editExpenseForm.description || null,
      amount: Number(editExpenseForm.amount),
      expense_date: editExpenseForm.expense_date,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] })
      setEditingExpenseId(null)
    },
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => financeApi.deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] }),
  })

  function startEditExpense(e: Expense) {
    setEditingExpenseId(e.id)
    setEditExpenseForm({
      category: e.category,
      description: e.description ?? '',
      amount: String(e.amount),
      expense_date: e.expense_date,
    })
  }

  function confirmDeleteExpense(id: number) {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.')) {
      deleteExpenseMutation.mutate(id)
    }
  }

  const totalInvoiced = invoices?.filter((i) => i.status !== 'cancelled').reduce((sum, i) => sum + i.amount, 0) ?? 0
  const totalPaid = invoices?.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) ?? 0
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Finance</h1>
        <p className="mt-1 text-sm text-slate-500">Factures et dépenses.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Facturé</p>
          <p className="mt-1 text-xl font-semibold text-slate-800">{totalInvoiced.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Encaissé</p>
          <p className="mt-1 text-xl font-semibold text-emerald-600">{totalPaid.toLocaleString('fr-FR')} €</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Dépenses</p>
          <p className="mt-1 text-xl font-semibold text-red-600">{totalExpenses.toLocaleString('fr-FR')} €</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button onClick={() => setTab('invoices')} className={`px-3 py-2 text-sm font-medium ${tab === 'invoices' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}>Factures</button>
          <button onClick={() => setTab('expenses')} className={`px-3 py-2 text-sm font-medium ${tab === 'expenses' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-slate-500'}`}>Dépenses</button>
        </div>
        <button
          onClick={() => tab === 'invoices' ? setShowInvoiceForm((v) => !v) : setShowExpenseForm((v) => !v)}
          className="mb-2 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
        >
          + {tab === 'invoices' ? 'Nouvelle facture' : 'Nouvelle dépense'}
        </button>
      </div>

      {tab === 'invoices' && showInvoiceForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <input value={invoiceForm.invoice_number} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })} placeholder="N° facture" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} placeholder="Montant €" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input type="date" value={invoiceForm.issue_date} onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select value={invoiceForm.client_id} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Client (optionnel)</option>
              {clients?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
            <select value={invoiceForm.project_id} onChange={(e) => setInvoiceForm({ ...invoiceForm, project_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Projet (optionnel)</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            disabled={!invoiceForm.invoice_number || !invoiceForm.amount || !invoiceForm.issue_date || createInvoiceMutation.isPending}
            onClick={() => createInvoiceMutation.mutate()}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Créer
          </button>
        </div>
      )}

      {tab === 'expenses' && showExpenseForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <input value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} placeholder="Catégorie" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} placeholder="Montant €" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="Description (optionnel)" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select value={expenseForm.project_id} onChange={(e) => setExpenseForm({ ...expenseForm, project_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Projet (optionnel)</option>
              {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            disabled={!expenseForm.category || !expenseForm.amount || !expenseForm.expense_date || createExpenseMutation.isPending}
            onClick={() => createExpenseMutation.mutate()}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Créer
          </button>
        </div>
      )}

      {tab === 'invoices' ? (
        <div className="rounded-lg border border-slate-200 bg-white">
          {loadingInvoices ? <p className="p-5 text-sm text-slate-500">Chargement…</p> : invoices && invoices.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-2">N°</th><th className="px-5 py-2">Client</th><th className="px-5 py-2">Montant</th><th className="px-5 py-2">Statut</th><th className="px-5 py-2 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-50">
                    <td className="px-5 py-3">{inv.invoice_number}</td>
                    <td className="px-5 py-3 text-slate-500">{inv.client?.name ?? '—'}</td>
                    <td className="px-5 py-3">{inv.amount.toLocaleString('fr-FR')} €</td>
                    <td className="px-5 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[inv.status]}`}>{STATUS_LABEL[inv.status]}</span></td>
                    <td className="px-5 py-3 text-right space-x-3">
                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                        <button onClick={() => markPaidMutation.mutate(inv.id)} className="text-xs font-medium text-brand-600 hover:underline">Marquer payée</button>
                      )}
                      {inv.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            if (window.confirm('Annuler cette facture ? Elle restera visible mais marquée comme annulée.')) {
                              cancelInvoiceMutation.mutate(inv.id)
                            }
                          }}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-sm text-slate-500">Aucune facture.</p>}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white">
          {loadingExpenses ? <p className="p-5 text-sm text-slate-500">Chargement…</p> : expenses && expenses.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-2">Catégorie</th><th className="px-5 py-2">Description</th><th className="px-5 py-2">Montant</th><th className="px-5 py-2">Date</th><th className="px-5 py-2 text-right">Actions</th>
              </tr></thead>
              <tbody>
                {expenses.map((e) => (
                  editingExpenseId === e.id ? (
                    <tr key={e.id} className="border-b border-slate-50 bg-slate-50">
                      <td className="px-5 py-3">
                        <input value={editExpenseForm.category} onChange={(ev) => setEditExpenseForm({ ...editExpenseForm, category: ev.target.value })} className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-3">
                        <input value={editExpenseForm.description} onChange={(ev) => setEditExpenseForm({ ...editExpenseForm, description: ev.target.value })} className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-3">
                        <input value={editExpenseForm.amount} onChange={(ev) => setEditExpenseForm({ ...editExpenseForm, amount: ev.target.value })} className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-3">
                        <input type="date" value={editExpenseForm.expense_date} onChange={(ev) => setEditExpenseForm({ ...editExpenseForm, expense_date: ev.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
                        <button
                          disabled={updateExpenseMutation.isPending}
                          onClick={() => updateExpenseMutation.mutate(e.id)}
                          className="text-xs font-medium text-emerald-600 hover:underline"
                        >
                          Enregistrer
                        </button>
                        <button onClick={() => setEditingExpenseId(null)} className="text-xs font-medium text-slate-500 hover:underline">
                          Annuler
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={e.id} className="border-b border-slate-50">
                      <td className="px-5 py-3">{e.category}</td>
                      <td className="px-5 py-3 text-slate-500">{e.description ?? '—'}</td>
                      <td className="px-5 py-3">{e.amount.toLocaleString('fr-FR')} €</td>
                      <td className="px-5 py-3 text-slate-500">{e.expense_date}</td>
                      <td className="px-5 py-3 text-right space-x-3">
                        <button onClick={() => startEditExpense(e)} className="text-xs font-medium text-brand-600 hover:underline">Modifier</button>
                        <button onClick={() => confirmDeleteExpense(e.id)} className="text-xs font-medium text-red-600 hover:underline">Supprimer</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          ) : <p className="p-5 text-sm text-slate-500">Aucune dépense.</p>}
        </div>
      )}
    </div>
  )
}