import { api } from '@/shared/lib/api'
import type { AppEvent } from '../types'

export const eventsApi = {
  list: async (includeCancelled = false) => {
    const { data } = await api.get<{ data: AppEvent[] }>('/events', {
      params: includeCancelled ? { include_cancelled: 1 } : undefined,
    })
    return data.data
  },

  create: async (payload: { title: string; location?: string; start_at: string }) => {
    const { data } = await api.post<{ data: AppEvent }>('/events', payload)
    return data.data
  },

  update: async (id: number, payload: Partial<{ title: string; location: string | null; start_at: string; end_at: string | null }>) => {
    const { data } = await api.patch<{ data: AppEvent }>(`/events/${id}`, payload)
    return data.data
  },

  cancel: async (id: number) => {
    const { data } = await api.delete<{ data: AppEvent }>(`/events/${id}`)
    return data.data
  },

  register: async (eventId: number) => {
    await api.post(`/events/${eventId}/register`)
  },
}