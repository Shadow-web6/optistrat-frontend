import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrApi } from '../api/hrApi'
import type { Collaborator } from '../types'

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div
        className="h-1.5 rounded-full bg-brand-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export default function HRPage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', position: '', department: '', user_id: '',
  })
  const [skillToAdd, setSkillToAdd] = useState({ skill_id: '', level: '3' })
  const [objectiveForm, setObjectiveForm] = useState({ title: '', target_date: '' })
  const [kpiForm, setKpiForm] = useState({ name: '', target_value: '', actual_value: '', unit: '', period: 'month', period_date: '' })

  const { data: collaborators, isLoading } = useQuery({
    queryKey: ['hr', 'collaborators'],
    queryFn: hrApi.listCollaborators,
  })

  const { data: detail } = useQuery({
    queryKey: ['hr', 'collaborators', selectedId],
    queryFn: () => hrApi.getCollaborator(selectedId!),
    enabled: selectedId !== null,
  })

  const { data: skillsList } = useQuery({
    queryKey: ['hr', 'skills'],
    queryFn: hrApi.listSkills,
  })

  const { data: linkableUsers } = useQuery({
    queryKey: ['hr', 'linkable-users'],
    queryFn: hrApi.linkableUsers,
  })

  const invalidateDetail = () => {
    queryClient.invalidateQueries({ queryKey: ['hr', 'collaborators'] })
    queryClient.invalidateQueries({ queryKey: ['hr', 'collaborators', selectedId] })
  }

  const createMutation = useMutation({
    mutationFn: () => hrApi.create({ ...form, user_id: form.user_id ? Number(form.user_id) : undefined }),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'collaborators'] })
      setForm({ first_name: '', last_name: '', email: '', phone: '', position: '', department: '', user_id: '' })
      setShowForm(false)
      setSelectedId(c.id)
    },
  })

  const addSkillMutation = useMutation({
    mutationFn: () => {
      const existing = (detail?.skills ?? []).map((s) => ({ skill_id: s.id, level: s.level ?? 3 }))
      return hrApi.updateSkills(selectedId!, {
        first_name: detail!.first_name,
        last_name: detail!.last_name,
        skills: [...existing, { skill_id: Number(skillToAdd.skill_id), level: Number(skillToAdd.level) }],
      })
    },
    onSuccess: () => {
      invalidateDetail()
      setSkillToAdd({ skill_id: '', level: '3' })
    },
  })

  const addObjectiveMutation = useMutation({
    mutationFn: () => hrApi.addObjective(selectedId!, objectiveForm),
    onSuccess: () => {
      invalidateDetail()
      setObjectiveForm({ title: '', target_date: '' })
    },
  })

  const addKpiMutation = useMutation({
    mutationFn: () =>
      hrApi.addKpi(selectedId!, {
        name: kpiForm.name,
        target_value: kpiForm.target_value ? Number(kpiForm.target_value) : undefined,
        actual_value: kpiForm.actual_value ? Number(kpiForm.actual_value) : undefined,
        unit: kpiForm.unit || undefined,
        period: kpiForm.period as 'month' | 'quarter' | 'year',
        period_date: kpiForm.period_date,
      }),
    onSuccess: () => {
      invalidateDetail()
      setKpiForm({ name: '', target_value: '', actual_value: '', unit: '', period: 'month', period_date: '' })
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Collaborateurs</h1>
          <p className="text-sm text-slate-500">Fiches, compétences, missions, objectifs et KPI.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouveau collaborateur
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Prénom" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Nom" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Poste" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Département" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Lier à un compte (optionnel)</option>
              {linkableUsers?.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
          {isLoading ? (
            <p className="p-5 text-sm text-slate-500">Chargement…</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {collaborators?.map((c: Collaborator) => (
                <li
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`cursor-pointer px-4 py-3 hover:bg-slate-50 ${selectedId === c.id ? 'bg-brand-50' : ''}`}
                >
                  <p className="text-sm font-medium text-slate-800">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-slate-500">{c.position ?? 'Poste non renseigné'}{c.department ? ` — ${c.department}` : ''}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white p-5">
          {!detail ? (
            <p className="text-sm text-slate-500">Sélectionne un collaborateur pour voir sa fiche.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{detail.first_name} {detail.last_name}</h2>
                <p className="text-sm text-slate-500">{detail.email}</p>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Compétences</h3>
                <div className="mb-2 flex flex-wrap gap-1">
                  {detail.skills?.map((s) => (
                    <span key={s.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {s.name} ({s.level}/5)
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value={skillToAdd.skill_id} onChange={(e) => setSkillToAdd({ ...skillToAdd, skill_id: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                    <option value="">Ajouter une compétence…</option>
                    {skillsList?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={skillToAdd.level} onChange={(e) => setSkillToAdd({ ...skillToAdd, level: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                  </select>
                  <button
                    disabled={!skillToAdd.skill_id || addSkillMutation.isPending}
                    onClick={() => addSkillMutation.mutate()}
                    className="rounded-md bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Objectifs</h3>
                {detail.objectives?.map((o) => (
                  <div key={o.id} className="mb-2">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">{o.title}</span>
                      <span className="text-slate-500">{o.progress}%</span>
                    </div>
                    <ProgressBar value={o.progress} />
                  </div>
                ))}
                <div className="mt-2 flex gap-2">
                  <input value={objectiveForm.title} onChange={(e) => setObjectiveForm({ ...objectiveForm, title: e.target.value })} placeholder="Nouvel objectif…" className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs" />
                  <input type="date" value={objectiveForm.target_date} onChange={(e) => setObjectiveForm({ ...objectiveForm, target_date: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
                  <button disabled={!objectiveForm.title || addObjectiveMutation.isPending} onClick={() => addObjectiveMutation.mutate()} className="rounded-md bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50">
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">KPI</h3>
                {detail.kpis?.map((k) => (
                  <div key={k.id} className="flex justify-between border-b border-slate-50 py-1.5 text-sm">
                    <span className="text-slate-700">{k.name}</span>
                    <span className="text-slate-500">{k.actual_value ?? '—'} / {k.target_value ?? '—'} {k.unit}</span>
                  </div>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <input value={kpiForm.name} onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })} placeholder="Nom du KPI" className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
                  <input value={kpiForm.target_value} onChange={(e) => setKpiForm({ ...kpiForm, target_value: e.target.value })} placeholder="Cible" className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
                  <input value={kpiForm.actual_value} onChange={(e) => setKpiForm({ ...kpiForm, actual_value: e.target.value })} placeholder="Actuel" className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
                  <input type="date" value={kpiForm.period_date} onChange={(e) => setKpiForm({ ...kpiForm, period_date: e.target.value })} className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
                </div>
                <button disabled={!kpiForm.name || !kpiForm.period_date || addKpiMutation.isPending} onClick={() => addKpiMutation.mutate()} className="mt-2 rounded-md bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700 disabled:opacity-50">
                  Ajouter le KPI
                </button>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Missions</h3>
                {detail.missions && detail.missions.length > 0 ? (
                  <ul className="space-y-1 text-sm text-slate-600">
                    {detail.missions.map((m) => (
                      <li key={m.id}>{m.title} {m.project ? `— ${m.project.name}` : ''} <span className="ml-2 text-xs text-slate-400">({m.status})</span></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">Aucune mission en cours.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}