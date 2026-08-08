import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api/projectsApi'

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
}

export default function ProjectKanbanPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const queryClient = useQueryClient()
  const [newTaskTitle, setNewTaskTitle] = useState<Record<number, string>>({})
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newDeliverableTitle, setNewDeliverableTitle] = useState('')

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.get(projectId),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects', projectId] })

  const createTaskMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: number; title: string }) =>
      projectsApi.createTask(projectId, { kanban_column_id: columnId, title }),
    onSuccess: invalidate,
  })

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, columnId }: { taskId: number; columnId: number }) =>
      projectsApi.moveTask(projectId, taskId, { kanban_column_id: columnId, order: 0 }),
    onSuccess: invalidate,
  })

  const addMilestoneMutation = useMutation({
    mutationFn: (title: string) => projectsApi.addMilestone(projectId, { title }),
    onSuccess: invalidate,
  })

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      projectsApi.updateMilestoneStatus(projectId, id, status),
    onSuccess: invalidate,
  })

  const addDeliverableMutation = useMutation({
    mutationFn: (title: string) => projectsApi.addDeliverable(projectId, title),
    onSuccess: invalidate,
  })

  const toggleDeliverableMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      projectsApi.updateDeliverableStatus(projectId, id, status),
    onSuccess: invalidate,
  })

  if (isLoading || !project) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  const columns = project.columns ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">{project.name}</h1>
        <p className="text-sm text-slate-500">{project.client?.name ?? 'Client non renseigné'}</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column, colIndex) => (
          <div key={column.id} className="w-72 shrink-0 rounded-lg bg-slate-100 p-3">
            <h2 className="mb-3 px-1 text-sm font-semibold text-slate-700">
              {column.name} <span className="text-slate-400">({column.tasks.length})</span>
            </h2>

            <div className="space-y-2">
              {column.tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-slate-800">{task.title}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${PRIORITY_COLOR[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="flex gap-1">
                      {colIndex > 0 && (
                        <button
                          onClick={() =>
                            moveTaskMutation.mutate({
                              taskId: task.id,
                              columnId: columns[colIndex - 1].id,
                            })
                          }
                          className="rounded px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Déplacer vers la colonne précédente"
                        >
                          ←
                        </button>
                      )}
                      {colIndex < columns.length - 1 && (
                        <button
                          onClick={() =>
                            moveTaskMutation.mutate({
                              taskId: task.id,
                              columnId: columns[colIndex + 1].id,
                            })
                          }
                          className="rounded px-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Déplacer vers la colonne suivante"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-1">
              <input
                value={newTaskTitle[column.id] ?? ''}
                onChange={(e) => setNewTaskTitle((prev) => ({ ...prev, [column.id]: e.target.value }))}
                placeholder="+ tâche"
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
              />
              <button
                onClick={() => {
                  const title = newTaskTitle[column.id]
                  if (!title) return
                  createTaskMutation.mutate({ columnId: column.id, title })
                  setNewTaskTitle((prev) => ({ ...prev, [column.id]: '' }))
                }}
                className="rounded-md bg-brand-600 px-2 text-xs text-white hover:bg-brand-700"
              >
                OK
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Jalons</h2>
          <div className="space-y-2">
            {project.milestones?.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{m.title}</span>
                <select
                  value={m.status}
                  onChange={(e) => toggleMilestoneMutation.mutate({ id: m.id, status: e.target.value })}
                  className={`rounded-full border-0 text-xs ${
                    m.status === 'reached' ? 'bg-emerald-50 text-emerald-700' :
                    m.status === 'missed' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <option value="pending">En attente</option>
                  <option value="reached">Atteint</option>
                  <option value="missed">Manqué</option>
                </select>
              </div>
            ))}
            {(!project.milestones || project.milestones.length === 0) && (
              <p className="text-xs text-slate-400">Aucun jalon.</p>
            )}
          </div>
          <div className="mt-3 flex gap-1">
            <input
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder="+ jalon"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
            />
            <button
              onClick={() => {
                if (!newMilestoneTitle) return
                addMilestoneMutation.mutate(newMilestoneTitle)
                setNewMilestoneTitle('')
              }}
              className="rounded-md bg-brand-600 px-2 text-xs text-white hover:bg-brand-700"
            >
              OK
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Livrables</h2>
          <div className="space-y-2">
            {project.deliverables?.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{d.title}</span>
                <button
                  onClick={() =>
                    toggleDeliverableMutation.mutate({
                      id: d.id,
                      status: d.status === 'delivered' ? 'pending' : 'delivered',
                    })
                  }
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    d.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {d.status === 'delivered' ? 'Livré' : 'En attente'}
                </button>
              </div>
            ))}
            {(!project.deliverables || project.deliverables.length === 0) && (
              <p className="text-xs text-slate-400">Aucun livrable.</p>
            )}
          </div>
          <div className="mt-3 flex gap-1">
            <input
              value={newDeliverableTitle}
              onChange={(e) => setNewDeliverableTitle(e.target.value)}
              placeholder="+ livrable"
              className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
            />
            <button
              onClick={() => {
                if (!newDeliverableTitle) return
                addDeliverableMutation.mutate(newDeliverableTitle)
                setNewDeliverableTitle('')
              }}
              className="rounded-md bg-brand-600 px-2 text-xs text-white hover:bg-brand-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
