import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '../api/crmApi'

export default function CRMPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', status: 'prospect', assigned_to: '',
  })

  const { data: prospects, isLoading } = useQuery({
    queryKey: ['crm', 'prospects'],
    queryFn: () => crmApi.list(),
  })

  const { data: teamMembers } = useQuery({
    queryKey: ['crm', 'assignable-users'],
    queryFn: crmApi.assignableUsers,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      crmApi.create({
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'prospects'] })
      setForm({ first_name: '', last_name: '', email: '', phone: '', status: 'prospect', assigned_to: '' })
      setShowForm(false)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">CRM — Prospects & clients</h1>
          <p className="mt-1 text-sm text-slate-500">Clique une ligne pour voir la fiche détaillée.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouveau contact
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="Prénom"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Nom"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Téléphone"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
            </select>
            <select
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Assigné à… (optionnel)</option>
              {teamMembers?.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={!form.first_name || !form.last_name || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-5 text-sm text-slate-500">Chargement…</p>
        ) : prospects && prospects.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-2">Nom</th>
                <th className="px-5 py-2">Email</th>
                <th className="px-5 py-2">Assigné à</th>
                <th className="px-5 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/crm/${p.id}`)}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-5 py-3">{p.first_name} {p.last_name}</td>
                  <td className="px-5 py-3 text-slate-500">{p.email ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{p.assigned_to?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'client' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {p.status === 'client' ? 'Client' : 'Prospect'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-sm text-slate-500">Aucun prospect/client pour le moment.</p>
        )}
      </div>
    </div>
  )
}