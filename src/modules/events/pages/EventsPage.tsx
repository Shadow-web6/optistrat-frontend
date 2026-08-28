import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../api/eventsApi'
import type { AppEvent } from '../types'

export default function EventsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [showCancelled, setShowCancelled] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: '', location: '', start_at: '' })

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', showCancelled],
    queryFn: () => eventsApi.list(showCancelled),
  })

  const createMutation = useMutation({
    mutationFn: () => eventsApi.create({ title, start_at: startAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setTitle('')
      setStartAt('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (id: number) => eventsApi.update(id, {
      title: editForm.title,
      location: editForm.location || null,
      start_at: editForm.start_at,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEditingId(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => eventsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const registerMutation = useMutation({
    mutationFn: (eventId: number) => eventsApi.register(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  function startEdit(ev: AppEvent) {
    setEditingId(ev.id)
    setEditForm({
      title: ev.title,
      location: ev.location ?? '',
      start_at: ev.start_at.slice(0, 16),
    })
  }

  function confirmCancel(ev: AppEvent) {
    if (window.confirm(`Annuler l'événement "${ev.title}" ? Les inscriptions resteront visibles mais l'événement sera marqué comme annulé.`)) {
      cancelMutation.mutate(ev.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Événements</h1>
          <p className="mt-1 text-sm text-slate-500">Ateliers, webinaires, rencontres cabinet.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
          Afficher les événements annulés
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'événement…"
          className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={!title || !startAt || createMutation.isPending}
          onClick={() => createMutation.mutate()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Créer
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <div className="space-y-3">
          {events?.map((ev) => (
            editingId === ev.id ? (
              <div key={ev.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Lieu"
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  type="datetime-local"
                  value={editForm.start_at}
                  onChange={(e) => setEditForm({ ...editForm, start_at: e.target.value })}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <div className="flex gap-3">
                  <button
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate(ev.id)}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Enregistrer
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-xs font-medium text-slate-500 hover:underline">
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div key={ev.id} className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 ${ev.is_cancelled ? 'opacity-60' : ''}`}>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {ev.title}
                    {ev.is_cancelled && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">Annulé</span>}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {new Date(ev.start_at).toLocaleString('fr-FR')}
                    {ev.location && ` — ${ev.location}`}
                    {' — '}{ev.registrations_count} inscrit{ev.registrations_count > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!ev.is_cancelled && (
                    <>
                      <button
                        disabled={ev.is_registered || registerMutation.isPending}
                        onClick={() => registerMutation.mutate(ev.id)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {ev.is_registered ? 'Inscrit ✓' : "S'inscrire"}
                      </button>
                      <button onClick={() => startEdit(ev)} className="text-xs font-medium text-brand-600 hover:underline">
                        Modifier
                      </button>
                      <button onClick={() => confirmCancel(ev)} className="text-xs font-medium text-red-600 hover:underline">
                        Annuler
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          ))}
          {events?.length === 0 && <p className="text-sm text-slate-500">Aucun événement.</p>}
        </div>
      )}
    </div>
  )
}