import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academyApi } from '../api/academyApi'
import { hrApi } from '@/modules/hr/api/hrApi'
import type { Course } from '../types'

export default function AcademyPage() {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [enrollingCourse, setEnrollingCourse] = useState<number | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', duration_hours: '' })

  const { data: courses, isLoading } = useQuery({
    queryKey: ['academy', 'courses', showArchived],
    queryFn: () => academyApi.list(showArchived),
  })

  const { data: collaborators } = useQuery({
    queryKey: ['hr', 'collaborators'],
    queryFn: hrApi.listCollaborators,
  })

  const createMutation = useMutation({
    mutationFn: () => academyApi.create({ title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'courses'] })
      setNewTitle('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (id: number) => academyApi.update(id, {
      title: editForm.title,
      description: editForm.description || null,
      duration_hours: editForm.duration_hours ? Number(editForm.duration_hours) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'courses'] })
      setEditingCourseId(null)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: number) => academyApi.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['academy', 'courses'] }),
  })

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, collaboratorId }: { courseId: number; collaboratorId: number }) =>
      academyApi.enroll(courseId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'courses'] })
      setEnrollingCourse(null)
    },
  })

  function startEdit(course: Course) {
    setEditingCourseId(course.id)
    setEditForm({
      title: course.title,
      description: course.description ?? '',
      duration_hours: course.duration_hours ? String(course.duration_hours) : '',
    })
  }

  function confirmArchive(course: Course) {
    if (window.confirm(`Archiver la formation "${course.title}" ? Elle ne sera plus proposée mais l'historique des inscriptions restera visible.`)) {
      archiveMutation.mutate(course.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Academy</h1>
          <p className="mt-1 text-sm text-slate-500">Formations internes et inscriptions.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Afficher les formations archivées
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Titre de la formation…"
          className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={!newTitle || createMutation.isPending}
          onClick={() => createMutation.mutate()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Créer
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => (
            <div key={course.id} className={`rounded-lg border bg-white p-4 ${course.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
              {editingCourseId === course.id ? (
                <div className="space-y-2">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={editForm.duration_hours}
                    onChange={(e) => setEditForm({ ...editForm, duration_hours: e.target.value })}
                    placeholder="Durée (h)"
                    className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <div className="flex gap-3">
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate(course.id)}
                      className="text-xs font-medium text-emerald-600 hover:underline"
                    >
                      Enregistrer
                    </button>
                    <button onClick={() => setEditingCourseId(null)} className="text-xs font-medium text-slate-500 hover:underline">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {course.title}
                      {!course.is_active && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Archivée</span>}
                    </h3>
                  </div>
                  {course.duration_hours && (
                    <p className="mt-0.5 text-xs text-slate-500">{course.duration_hours}h</p>
                  )}

                  <div className="mt-3 space-y-1">
                    {course.enrollments.map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{e.collaborator.name}</span>
                        <span className={e.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}>
                          {e.status === 'completed' ? 'Terminé' : 'Inscrit'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {course.is_active && (
                    enrollingCourse === course.id ? (
                      <select
                        autoFocus
                        onChange={(e) => {
                          if (e.target.value) {
                            enrollMutation.mutate({ courseId: course.id, collaboratorId: Number(e.target.value) })
                          }
                        }}
                        onBlur={() => setEnrollingCourse(null)}
                        className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                      >
                        <option value="">Choisir un collaborateur…</option>
                        {collaborators?.map((c) => (
                          <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setEnrollingCourse(course.id)}
                        className="mt-3 text-xs text-brand-600 hover:underline"
                      >
                        + Inscrire un collaborateur
                      </button>
                    )
                  )}

                  <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
                    <button onClick={() => startEdit(course)} className="text-xs font-medium text-brand-600 hover:underline">
                      Modifier
                    </button>
                    {course.is_active && (
                      <button onClick={() => confirmArchive(course)} className="text-xs font-medium text-red-600 hover:underline">
                        Archiver
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}