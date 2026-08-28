import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { portalApi } from '../api/portalApi'
import { osdApi } from '@/modules/osd/api/osdApi'

export default function MyDiagnosticsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<number | ''>('')

  const { data: diagnostics, isLoading } = useQuery({
    queryKey: ['portal', 'diagnostics'],
    queryFn: portalApi.myDiagnostics,
  })

  const { data: questionnaires, isLoading: loadingQuestionnaires } = useQuery({
    queryKey: ['portal', 'questionnaires'],
    queryFn: portalApi.listActiveQuestionnaires,
  })

  const startMutation = useMutation({
    mutationFn: (questionnaireId: number) => portalApi.startDiagnostic(questionnaireId),
    onSuccess: (diagnostic) => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'diagnostics'] })
      navigate(`/mon-espace/diagnostics/${diagnostic.id}`)
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-xl font-semibold text-slate-800">Mes diagnostics</h1>
        <p className="text-sm text-slate-500">Lancez un nouveau diagnostic ou consultez vos rapports.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouveau diagnostic</h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedQuestionnaire}
            onChange={(e) => setSelectedQuestionnaire(Number(e.target.value))}
            disabled={loadingQuestionnaires}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Sélectionner un questionnaire…</option>
            {questionnaires?.map((q: any) => (
              <option key={q.id} value={q.id}>{q.title}</option>
            ))}
          </select>
          <button
            disabled={!selectedQuestionnaire || startMutation.isPending}
            onClick={() => selectedQuestionnaire && startMutation.mutate(Number(selectedQuestionnaire))}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {startMutation.isPending ? 'Démarrage…' : 'Démarrer'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : diagnostics && diagnostics.length > 0 ? (
        <div className="space-y-3">
          {diagnostics.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{d.questionnaire.title}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(d.completed_at).toLocaleDateString('fr-FR')} — Score : {d.overall_score?.toFixed(1)} / 10
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/mon-espace/diagnostics/${d.id}`)}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Voir le détail
                </button>
                <button
                  onClick={() => osdApi.downloadDiagnosticPdf(d.id, `diagnostic-${d.id}.pdf`)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Télécharger le PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucun diagnostic pour le moment.</p>
      )}
    </div>
  )
}