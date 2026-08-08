import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmApi } from '../api/crmApi'

const TYPE_LABEL: Record<string, string> = {
  call: 'Appel',
  email: 'Email',
  meeting: 'Réunion',
  note: 'Note',
}

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const prospectId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [type, setType] = useState('note')
  const [content, setContent] = useState('')
  const [reminderAt, setReminderAt] = useState('')

  const { data: prospect, isLoading } = useQuery({
    queryKey: ['crm', 'prospects', prospectId],
    queryFn: () => crmApi.get(prospectId),
  })

  const accessMutation = useMutation({
    mutationFn: () => crmApi.createPortalAccess(prospectId),
  })

  const addInteractionMutation = useMutation({
    mutationFn: () =>
      crmApi.addInteraction(prospectId, {
        type,
        content,
        reminder_at: reminderAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'prospects', prospectId] })
      setContent('')
      setReminderAt('')
    },
  })

  if (isLoading || !prospect) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate('/crm')} className="text-sm text-slate-500 hover:text-slate-800">
        ← Retour au CRM
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {prospect.first_name} {prospect.last_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {prospect.email ?? 'Email non renseigné'} {prospect.phone && `— ${prospect.phone}`}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Assigné à : {prospect.assigned_to?.name ?? 'Personne'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs ${prospect.status === 'client' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {prospect.status === 'client' ? 'Client' : 'Prospect'}
          </span>
          {prospect.status === 'client' && (
            <button
              onClick={() => accessMutation.mutate()}
              disabled={accessMutation.isPending}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Créer accès portail
            </button>
          )}
        </div>
      </div>

      {accessMutation.isSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Email : <strong>{accessMutation.data.email}</strong>
          {accessMutation.data.temporary_password && (
            <> — Mot de passe : <strong>{accessMutation.data.temporary_password}</strong></>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Ajouter une interaction</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="note">Note</option>
            <option value="call">Appel</option>
            <option value="email">Email</option>
            <option value="meeting">Réunion</option>
          </select>
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) => setReminderAt(e.target.value)}
            title="Date de relance (optionnel)"
            className="rounded-md border border-slate-300 px-2 py-2 text-sm"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="Détail de l'interaction…"
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={!content || addInteractionMutation.isPending}
          onClick={() => addInteractionMutation.mutate()}
          className="mt-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {addInteractionMutation.isPending ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Historique</h2>
        {prospect.interactions && prospect.interactions.length > 0 ? (
          <div className="space-y-3">
            {prospect.interactions.map((i) => (
              <div key={i.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-brand-600">{TYPE_LABEL[i.type]}</span>
                  <span>{i.author.name} — {new Date(i.created_at).toLocaleString('fr-FR')}</span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{i.content}</p>
                {i.reminder_at && (
                  <p className="mt-1 text-xs text-amber-600">
                    Relance prévue le {new Date(i.reminder_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune interaction enregistrée.</p>
        )}
      </div>
    </div>
  )
}