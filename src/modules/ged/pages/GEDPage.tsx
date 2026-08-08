import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/lib/api'
import { gedApi } from '../api/gedApi'
import { projectsApi } from '@/modules/projects/api/projectsApi'
import { crmApi } from '@/modules/crm/api/crmApi'

function formatSize(bytes: number | null) {
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${(bytes / 1024).toFixed(0)} Ko`
}

export default function GEDPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [clientId, setClientId] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')

  const { data: documents, isLoading } = useQuery({
    queryKey: ['ged', 'documents', search, favoritesOnly, categoryId],
    queryFn: () => gedApi.list({
      search: search || undefined,
      favorites_only: favoritesOnly || undefined,
      category_id: categoryId ? Number(categoryId) : undefined,
    }),
  })

  const { data: categories } = useQuery({
    queryKey: ['ged', 'categories'],
    queryFn: gedApi.listCategories,
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })

  const { data: clients } = useQuery({
    queryKey: ['crm', 'prospects', 'client'],
    queryFn: () => crmApi.list('client'),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      gedApi.upload({
        title: file.name,
        file,
        category_id: categoryId ? Number(categoryId) : undefined,
        project_id: projectId ? Number(projectId) : undefined,
        client_id: clientId ? Number(clientId) : undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ged', 'documents'] }),
  })

  const createCategoryMutation = useMutation({
    mutationFn: () => gedApi.createCategory(newCategoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ged', 'categories'] })
      setNewCategoryName('')
    },
  })

  const favoriteMutation = useMutation({
    mutationFn: (documentId: number) => gedApi.toggleFavorite(documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ged', 'documents'] }),
  })

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadMutation.mutate(file)
    e.target.value = ''
  }

  async function handleDownload(documentId: number, filename: string) {
    const response = await api.get(`/ged/documents/${documentId}/download`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Documents</h1>
        <p className="mt-1 text-sm text-slate-500">Stockage, versions, recherche et favoris.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Ajouter un document</h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="">Catégorie (optionnel)</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="">Projet lié (optionnel)</option>
            {projects?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="">Client lié (optionnel)</option>
            {clients?.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            {uploadMutation.isPending ? 'Envoi…' : '+ Choisir un fichier'}
            <input type="file" onChange={handleFileSelect} className="hidden" disabled={uploadMutation.isPending} />
          </label>

          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nouvelle catégorie…"
            className="rounded-md border border-slate-300 px-2 py-2 text-xs"
          />
          <button
            disabled={!newCategoryName || createCategoryMutation.isPending}
            onClick={() => createCategoryMutation.mutate()}
            className="rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            + Catégorie
          </button>
        </div>

        {uploadMutation.isError && (
          <p className="text-sm text-red-600">
            Échec : {(uploadMutation.error as any)?.response?.data?.message ?? 'erreur inconnue'}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un document…"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} />
          Favoris uniquement
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-5 text-sm text-slate-500">Chargement…</p>
        ) : documents && documents.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400">
                <th className="px-5 py-2">Titre</th>
                <th className="px-5 py-2">Catégorie</th>
                <th className="px-5 py-2">Projet</th>
                <th className="px-5 py-2">Taille</th>
                <th className="px-5 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <button
                      onClick={() => favoriteMutation.mutate(doc.id)}
                      className={`mr-2 ${doc.is_favorite ? 'text-amber-500' : 'text-slate-300'}`}
                    >
                      ★
                    </button>
                    {doc.title}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{doc.category?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{doc.project?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{formatSize(doc.latest_version?.file_size ?? null)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleDownload(doc.id, doc.latest_version?.original_name ?? doc.title)}
                      className="text-brand-600 hover:underline"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-5 text-sm text-slate-500">Aucun document.</p>
        )}
      </div>
    </div>
  )
}