import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '../api/crmApi'

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ prospect_id: '', pipeline_stage_id: '', title: '', estimated_value: '' })

  const { data: stages, isLoading: loadingStages } = useQuery({
    queryKey: ['crm', 'pipeline-stages'],
    queryFn: crmApi.listPipelineStages,
  })

  const { data: opportunities, isLoading: loadingOpps } = useQuery({
    queryKey: ['crm', 'opportunities'],
    queryFn: crmApi.listOpportunities,
  })

  const { data: prospects } = useQuery({
    queryKey: ['crm', 'prospects'],
    queryFn: () => crmApi.list(),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] })

  const createMutation = useMutation({
    mutationFn: () =>
      crmApi.createOpportunity({
        prospect_id: Number(form.prospect_id),
        pipeline_stage_id: Number(form.pipeline_stage_id),
        title: form.title,
        estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
      }),
    onSuccess: () => {
      invalidate()
      setForm({ prospect_id: '', pipeline_stage_id: '', title: '', estimated_value: '' })
      setShowForm(false)
    },
  })

  const moveMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: number; stageId: number }) => crmApi.moveOpportunity(id, stageId),
    onSuccess: invalidate,
  })

  if (loadingStages || loadingOpps) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Pipeline commercial</h1>
          <p className="mt-1 text-sm text-slate-500">Suivi des opportunités par étape.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nouvelle opportunité
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <select value={form.prospect_id} onChange={(e) => setForm({ ...form, prospect_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Prospect / client…</option>
              {prospects?.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </select>
            <select value={form.pipeline_stage_id} onChange={(e) => setForm({ ...form, pipeline_stage_id: e.target.value })} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Étape…</option>
              {stages?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de l'affaire" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} placeholder="Valeur estimée €" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button
            disabled={!form.prospect_id || !form.pipeline_stage_id || !form.title || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Créer
          </button>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages?.map((stage, stageIndex) => {
          const stageOpps = opportunities?.filter((o) => o.pipeline_stage_id === stage.id) ?? []
          const stageTotal = stageOpps.reduce((sum, o) => sum + (o.estimated_value ?? 0), 0)

          return (
            <div key={stage.id} className="w-72 shrink-0 rounded-lg bg-slate-100 p-3">
              <h2 className="mb-1 px-1 text-sm font-semibold text-slate-700">
                {stage.name} <span className="text-slate-400">({stageOpps.length})</span>
              </h2>
              {stageTotal > 0 && (
                <p className="mb-3 px-1 text-xs text-slate-500">{stageTotal.toLocaleString('fr-FR')} €</p>
              )}

              <div className="space-y-2">
                {stageOpps.map((opp) => (
                  <div key={opp.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="text-sm text-slate-800">{opp.title}</p>
                    <p className="text-xs text-slate-500">{opp.prospect.name}</p>
                    {opp.estimated_value !== null && (
                      <p className="mt-1 text-xs font-medium text-brand-600">
                        {opp.estimated_value.toLocaleString('fr-FR')} €
                      </p>
                    )}
                    <div className="mt-2 flex gap-1">
                      {stageIndex > 0 && (
                        <button
                          onClick={() => moveMutation.mutate({ id: opp.id, stageId: stages[stageIndex - 1].id })}
                          className="rounded px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          ←
                        </button>
                      )}
                      {stageIndex < stages.length - 1 && (
                        <button
                          onClick={() => moveMutation.mutate({ id: opp.id, stageId: stages[stageIndex + 1].id })}
                          className="rounded px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}