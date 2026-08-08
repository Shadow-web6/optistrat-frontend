import { api } from '@/shared/lib/api'
import type { Course } from '../types'

export const academyApi = {
  list: async () => {
    const { data } = await api.get<{ data: Course[] }>('/academy/courses')
    return data.data
  },

  create: async (payload: { title: string; description?: string; duration_hours?: number }) => {
    const { data } = await api.post<{ data: Course }>('/academy/courses', payload)
    return data.data
  },

  enroll: async (courseId: number, collaboratorId: number) => {
    const { data } = await api.post(`/academy/courses/${courseId}/enroll`, {
      collaborator_id: collaboratorId,
    })
    return data.data
  },
}