import { api } from '@/shared/lib/api'
import type { Project } from '../types'

export const projectsApi = {
  list: async () => {
    const { data } = await api.get<{ data: Project[] }>('/projects')
    return data.data
  },

  get: async (id: number) => {
    const { data } = await api.get<{ data: Project }>(`/projects/${id}`)
    return data.data
  },

  create: async (payload: { name: string; description?: string; status?: string; client_id?: number; manager_id?: number }) => {
    const { data } = await api.post<{ data: Project }>('/projects', payload)
    return data.data
  },
  
  createTask: async (
    projectId: number,
    payload: { kanban_column_id: number; title: string; priority?: string; due_date?: string }
  ) => {
    const { data } = await api.post(`/projects/${projectId}/tasks`, payload)
    return data.data
  },

  moveTask: async (
    projectId: number,
    taskId: number,
    payload: { kanban_column_id: number; order: number }
  ) => {
    const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}/move`, payload)
    return data.data
  },
  teamMembers: async () => {
    const { data } = await api.get<{ data: { id: number; name: string }[] }>('/projects/team-members')
    return data.data
  },

  addMilestone: async (projectId: number, payload: { title: string; due_date?: string }) => {
    const { data } = await api.post(`/projects/${projectId}/milestones`, payload)
    return data.data
  },

  updateMilestoneStatus: async (projectId: number, milestoneId: number, status: string) => {
    const { data } = await api.patch(`/projects/${projectId}/milestones/${milestoneId}`, { status })
    return data.data
  },

  addDeliverable: async (projectId: number, title: string) => {
    const { data } = await api.post(`/projects/${projectId}/deliverables`, { title })
    return data.data
  },

  updateDeliverableStatus: async (projectId: number, deliverableId: number, status: string) => {
    const { data } = await api.patch(`/projects/${projectId}/deliverables/${deliverableId}`, { status })
    return data.data
  },
}
