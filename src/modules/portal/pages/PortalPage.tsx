import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'
import type { ClientRequest } from '../types'

const STATUS_LABEL: Record<string, string> = {
  open: 'Ouverte',
  in_progress: 'En cours',
  closed: 'Fermée',
}

export default function PortalPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<ClientRequest | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['portal', 'requests'],
    queryFn: () => portalApi.listRequests(),
  })

  const replyMutation = useMutation({
    mutationFn: () =>
      portalApi.reply(selected!.id, { reply: replyText, status: 'closed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'requests'] })
      setSelected(null)
      setReplyText('')
    },
  })

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-800">Portail client — Demandes</h1>
      <p className="mb-6 text-sm text-slate-500">
        Messages envoyés par les clients depuis leur espace portail.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
          {isLoading ? (
            <p className="p-5 text-sm text-slate-500">Chargement…</p>
          ) : requests && requests.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {requests.map((r) => (
                <li
                  key={r.id}
                  onClick={() => { setSelected(r); setReplyText(r.reply ?? '') }}
                  className={`cursor-pointer px-4 py-3 hover:bg-slate-50 ${selected?.id === r.id ? 'bg-brand-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{r.subject}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${
                      r.status === 'closed' ? 'bg-slate-100 text-slate-500' :
                      r.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{r.prospect.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-slate-500">Aucune demande pour le moment.</p>
          )}
        </div>

        <div className="lg:col-span-3 rounded-lg border border-slate-200 bg-white p-5">
          {!selected ? (
            <p className="text-sm text-slate-500">Sélectionne une demande pour la traiter.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{selected.subject}</h2>
                <p className="text-xs text-slate-500">{selected.prospect.name} — {new Date(selected.created_at).toLocaleDateString('fr-FR')}</p>
              </div>

              <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                {selected.message}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Réponse</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Ta réponse au client…"
                />
              </div>

              <button
                disabled={!replyText || replyMutation.isPending}
                onClick={() => replyMutation.mutate()}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {replyMutation.isPending ? 'Envoi…' : 'Répondre et clôturer'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}