import { useQuery } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'
import { osdApi } from '@/modules/osd/api/osdApi'

export default function MyDiagnosticsPage() {
  const { data: diagnostics, isLoading } = useQuery({
    queryKey: ['portal', 'diagnostics'],
    queryFn: portalApi.myDiagnostics,
  })

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-800">Mes diagnostics</h1>
      <p className="mb-6 text-sm text-slate-500">Vos rapports de diagnostic stratégique.</p>

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
              
              <a href={osdApi.downloadPdfUrl(d.id)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Télécharger le PDF
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucun diagnostic disponible pour le moment.</p>
      )}
    </div>
  )
}