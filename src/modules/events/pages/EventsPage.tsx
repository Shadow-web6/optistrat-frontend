import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../api/eventsApi'

export default function EventsPage() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.list,
  })

  const createMutation = useMutation({
    mutationFn: () => eventsApi.create({ title, start_at: startAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setTitle('')
      setStartAt('')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (eventId: number) => eventsApi.register(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Événements</h1>
        <p className="mt-1 text-sm text-slate-500">Ateliers, webinaires, rencontres cabinet.</p>
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
            <div key={ev.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{ev.title}</h3>
                <p className="text-xs text-slate-500">
                  {new Date(ev.start_at).toLocaleString('fr-FR')}
                  {ev.location && ` — ${ev.location}`}
                  {' — '}{ev.registrations_count} inscrit{ev.registrations_count > 1 ? 's' : ''}
                </p>
              </div>
              <button
                disabled={ev.is_registered || registerMutation.isPending}
                onClick={() => registerMutation.mutate(ev.id)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {ev.is_registered ? 'Inscrit ✓' : "S'inscrire"}
              </button>
            </div>
          ))}
          {events?.length === 0 && <p className="text-sm text-slate-500">Aucun événement.</p>}
        </div>
      )}
    </div>
  )
}