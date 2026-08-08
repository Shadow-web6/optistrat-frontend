import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboardApi'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  })

  if (isLoading || !stats) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  const hasCommercial = stats.crm || stats.osd
  const hasOperations = stats.hr || stats.projects || stats.ged

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de l'activité du cabinet.</p>
      </div>

      {hasCommercial && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-600">Commercial</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.crm && (
              <>
                <StatCard label="Prospects" value={stats.crm.prospects} />
                <StatCard label="Clients" value={stats.crm.clients} />
              </>
            )}
            {stats.osd && (
              <>
                <StatCard label="Diagnostics réalisés" value={stats.osd.diagnostics_completed} />
                <StatCard label="Score moyen OSD" value={`${stats.osd.average_score || 0} / 10`} />
              </>
            )}
          </div>
        </div>
      )}

      {hasOperations && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-600">Opérations</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.hr && <StatCard label="Collaborateurs actifs" value={stats.hr.collaborators} />}
            {stats.projects && (
              <>
                <StatCard label="Projets actifs" value={stats.projects.active} sub={`${stats.projects.total} au total`} />
                <StatCard label="Tâches ouvertes" value={stats.projects.open_tasks} />
              </>
            )}
            {stats.ged && <StatCard label="Documents" value={stats.ged.documents} />}
          </div>
        </div>
      )}

      {stats.finance && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-600">Finance</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Facturé" value={`${stats.finance.invoiced.toLocaleString('fr-FR')} €`} />
            <StatCard label="Encaissé" value={`${stats.finance.paid.toLocaleString('fr-FR')} €`} />
            <StatCard label="Dépenses" value={`${stats.finance.expenses.toLocaleString('fr-FR')} €`} />
            <StatCard label="Marge brute" value={`${(stats.finance.paid - stats.finance.expenses).toLocaleString('fr-FR')} €`} />
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-600">Autres</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Formations Academy" value={stats.academy.courses} />
          <StatCard label="Événements à venir" value={stats.events.upcoming} />
        </div>
      </div>
    </div>
  )
}