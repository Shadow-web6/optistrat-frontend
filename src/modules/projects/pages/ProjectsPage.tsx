import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../api/projectsApi'
import { crmApi } from '@/modules/crm/api/crmApi'

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planifié',
  active: 'Actif',
  on_hold: 'En pause',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', client_id: '', manager_id: '' })

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const { data: clients } = useQuery({
    queryKey: ['crm', 'prospects', 'client'],
    queryFn: () => crmApi.list('client'),
  })

  const { data: teamMembers } = useQuery({
    queryKey: ['projects', 'team-members'],
    queryFn: projectsApi.teamMembers,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      projectsApi.create({
        name: form.name,
        client_id: form.client_id ? Number(form.client_id) : undefined,
        manager_id: form.manager_id ? Number(form.manager_id) : undefined,
      }),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setForm({ name: '', client_id: '', manager_id: '' })
      setShowForm(false)
      navigate(`/projects/${project.id}`)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Projets</h1>
          <p className="mt-1 text-sm text-slate-500">Suivi des missions clients, Kanban et jalons.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouveau projet
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nom du projet"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Client (optionnel)</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
            <select
              value={form.manager_id}
              onChange={(e) => setForm({ ...form, manager_id: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Manager (optionnel)</option>
              {teamMembers?.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button
            disabled={!form.name || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300 hover:shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {STATUS_LABEL[p.status]}
                </span>
              </div>
              <p className="text-xs text-slate-500">{p.client?.name ?? 'Client non renseigné'}</p>
              {p.manager && <p className="text-xs text-slate-400">Manager : {p.manager.name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}