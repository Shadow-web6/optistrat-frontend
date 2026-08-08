import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { academyApi } from '../api/academyApi'
import { hrApi } from '@/modules/hr/api/hrApi'

export default function AcademyPage() {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [enrollingCourse, setEnrollingCourse] = useState<number | null>(null)

  const { data: courses, isLoading } = useQuery({
    queryKey: ['academy', 'courses'],
    queryFn: academyApi.list,
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

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, collaboratorId }: { courseId: number; collaboratorId: number }) =>
      academyApi.enroll(courseId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', 'courses'] })
      setEnrollingCourse(null)
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Academy</h1>
        <p className="mt-1 text-sm text-slate-500">Formations internes et inscriptions.</p>
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
            <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-800">{course.title}</h3>
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

              {enrollingCourse === course.id ? (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}