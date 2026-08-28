import { api } from '@/shared/lib/api'
import type { Course } from '../types'

export const academyApi = {
  list: async (includeArchived = false) => {
    const { data } = await api.get<{ data: Course[] }>('/academy/courses', {
      params: includeArchived ? { include_archived: 1 } : undefined,
    })
    return data.data
  },

  create: async (payload: { title: string; description?: string; duration_hours?: number }) => {
    const { data } = await api.post<{ data: Course }>('/academy/courses', payload)
    return data.data
  },

  update: async (id: number, payload: Partial<{ title: string; description: string | null; duration_hours: number | null }>) => {
    const { data } = await api.patch<{ data: Course }>(`/academy/courses/${id}`, payload)
    return data.data
  },

  archive: async (id: number) => {
    const { data } = await api.delete<{ data: Course }>(`/academy/courses/${id}`)
    return data.data
  },

  enroll: async (courseId: number, collaboratorId: number) => {
    const { data } = await api.post(`/academy/courses/${courseId}/enroll`, {
      collaborator_id: collaboratorId,
    })
    return data.data
  },
}