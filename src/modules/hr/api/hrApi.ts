import { api } from '@/shared/lib/api'
import type { Collaborator, Skill, LinkableUser } from '../types'
export const hrApi = {
  listCollaborators: async () => {
    const { data } = await api.get<{ data: Collaborator[] }>('/hr/collaborators')
    return data.data
  },

  getCollaborator: async (id: number) => {
    const { data } = await api.get<{ data: Collaborator }>(`/hr/collaborators/${id}`)
    return data.data
  },

  createCollaborator: async (payload: Partial<Collaborator>) => {
    const { data } = await api.post<{ data: Collaborator }>('/hr/collaborators', payload)
    return data.data
  },

  listSkills: async () => {
    const { data } = await api.get<{ data: Skill[] }>('/hr/skills')
    return data.data
  },

  addObjective: async (
    collaboratorId: number,
    payload: { title: string; target_date?: string; progress?: number }
  ) => {
    const { data } = await api.post(`/hr/collaborators/${collaboratorId}/objectives`, payload)
    return data.data
  },

  addKpi: async (
    collaboratorId: number,
    payload: {
      name: string
      target_value?: number
      actual_value?: number
      unit?: string
      period: 'month' | 'quarter' | 'year'
      period_date: string
    }
  ) => {
    const { data } = await api.post(`/hr/collaborators/${collaboratorId}/kpis`, payload)
    return data.data
  },

  create: async (payload: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    position?: string
    department?: string
    hire_date?: string
    user_id?: number
  }) => {
    const { data } = await api.post<{ data: Collaborator }>('/hr/collaborators', payload)
    return data.data
  },

  linkableUsers: async () => {
    const { data } = await api.get<{ data: LinkableUser[] }>('/hr/collaborators/linkable-users')
    return data.data
  },

  updateSkills: async (
    collaboratorId: number,
    payload: { first_name: string; last_name: string; skills: { skill_id: number; level: number }[] }
  ) => {
    const { data } = await api.put<{ data: Collaborator }>(`/hr/collaborators/${collaboratorId}`, payload)
    return data.data
  },
}
