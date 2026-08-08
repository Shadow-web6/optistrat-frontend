import { api } from '@/shared/lib/api'
import type { AppEvent } from '../types'

export const eventsApi = {
  list: async () => {
    const { data } = await api.get<{ data: AppEvent[] }>('/events')
    return data.data
  },

  create: async (payload: { title: string; location?: string; start_at: string }) => {
    const { data } = await api.post<{ data: AppEvent }>('/events', payload)
    return data.data
  },

  register: async (eventId: number) => {
    await api.post(`/events/${eventId}/register`)
  },
}