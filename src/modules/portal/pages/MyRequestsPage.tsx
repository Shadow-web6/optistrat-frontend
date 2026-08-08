import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { portalApi } from '../api/portalApi'

export default function MyRequestsPage() {
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['portal', 'my-requests'],
    queryFn: portalApi.myRequests,
  })

  const sendMutation = useMutation({
    mutationFn: () => portalApi.sendRequest({ subject, message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'my-requests'] })
      setSubject('')
      setMessage('')
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-xl font-semibold text-slate-800">Mes demandes</h1>
        <p className="text-sm text-slate-500">Contactez OptiStrat Group directement depuis votre espace.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Sujet…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Votre message…"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={!subject || !message || sendMutation.isPending}
          onClick={() => sendMutation.mutate()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {sendMutation.isPending ? 'Envoi…' : 'Envoyer'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">{r.subject}</h3>
                <span className="text-xs text-slate-400">
                  {r.status === 'closed' ? 'Répondu' : 'En attente'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{r.message}</p>
              {r.reply && (
                <div className="mt-2 rounded-md bg-slate-50 p-2 text-sm text-slate-700">
                  <strong>Réponse OptiStrat :</strong> {r.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucune demande envoyée.</p>
      )}
    </div>
  )
}