import { useQuery } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'

export default function MyProjectsPage() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['portal', 'projects'],
    queryFn: portalApi.myProjects,
  })

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-800">Mes missions</h1>
      <p className="mb-6 text-sm text-slate-500">Suivi des projets menés avec OptiStrat Group.</p>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((p: any) => (
            <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{p.description}</p>
              {p.milestones && p.milestones.length > 0 && (
                <div className="mt-3 space-y-1">
                  {p.milestones.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{m.title}</span>
                      <span className={m.status === 'reached' ? 'text-emerald-600' : 'text-slate-400'}>
                        {m.due_date ? new Date(m.due_date).toLocaleDateString('fr-FR') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucune mission en cours.</p>
      )}
    </div>
  )
}