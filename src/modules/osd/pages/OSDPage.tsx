import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { osdApi } from '../api/osdApi'

export default function OSDPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<number | ''>('')

  const { data: questionnaires, isLoading: loadingQuestionnaires } = useQuery({
    queryKey: ['osd', 'questionnaires'],
    queryFn: osdApi.listQuestionnaires,
  })

  const { data: diagnostics, isLoading: loadingDiagnostics } = useQuery({
    queryKey: ['osd', 'diagnostics'],
    queryFn: () => osdApi.listDiagnostics(),
  })

  const startMutation = useMutation({
    mutationFn: osdApi.startDiagnostic,
    onSuccess: (diagnostic) => {
      queryClient.invalidateQueries({ queryKey: ['osd', 'diagnostics'] })
      navigate(`/osd/diagnostics/${diagnostic.id}`)
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Diagnostic stratégique (OSD)</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lancez un nouveau diagnostic ou consultez l'historique.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouveau diagnostic</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedQuestionnaire}
            onChange={(e) => setSelectedQuestionnaire(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            disabled={loadingQuestionnaires}
          >
            <option value="">Sélectionner un questionnaire…</option>
            {questionnaires?.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          <button
            disabled={!selectedQuestionnaire || startMutation.isPending}
            onClick={() =>
              selectedQuestionnaire &&
              startMutation.mutate({ questionnaire_id: selectedQuestionnaire })
            }
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {startMutation.isPending ? 'Démarrage…' : 'Démarrer'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
          Historique
        </h2>
        {loadingDiagnostics ? (
          <p className="p-5 text-sm text-slate-500">Chargement…</p>
        ) : diagnostics && diagnostics.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-2">Questionnaire</th>
                <th className="px-5 py-2">Client / prospect</th>
                <th className="px-5 py-2">Statut</th>
                <th className="px-5 py-2">Score</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.map((d) => (
                <tr
                  key={d.id}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                  onClick={() => navigate(`/osd/diagnostics/${d.id}`)}
                >
                  <td className="px-5 py-3">{d.questionnaire.title}</td>
                  <td className="px-5 py-3">{d.prospect?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {d.status === 'completed' ? 'Terminé' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {d.overall_score !== null ? `${d.overall_score.toFixed(1)} / 10` : '—'}
                  </td>
                  <td className="px-5 py-3 text-brand-600">Voir →</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-sm text-slate-500">Aucun diagnostic pour le moment.</p>
        )}
      </div>
    </div>
  )
}
