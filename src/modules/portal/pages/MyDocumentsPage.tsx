import { useQuery } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'
import { api } from '@/shared/lib/api'

export default function MyDocumentsPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['portal', 'documents'],
    queryFn: portalApi.myDocuments,
  })

  async function handleDownload(documentId: number, filename: string) {
    const response = await api.get(`/ged/documents/${documentId}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = window.document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-800">Mes documents</h1>
      <p className="mb-6 text-sm text-slate-500">Documents partagés par OptiStrat Group.</p>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : documents && documents.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-800">{doc.title}</span>
              <button
                onClick={() => handleDownload(doc.id, doc.latest_version?.original_name ?? doc.title)}
                className="text-xs text-brand-600 hover:underline"
              >
                Télécharger
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucun document disponible pour le moment.</p>
      )}
    </div>
  )
}