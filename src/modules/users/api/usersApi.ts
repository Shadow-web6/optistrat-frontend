import { api } from '@/shared/lib/api'
import type { StaffUser } from '../types'

export const usersApi = {
  list: async () => {
    const { data } = await api.get<{ data: StaffUser[] }>('/users')
    return data.data
  },

  create: async (payload: { name: string; email: string; role: string }) => {
    const { data } = await api.post<{ email: string; temporary_password: string }>('/users', payload)
    return data
  },

  update: async (userId: number, payload: { role?: string; is_active?: boolean }) => {
    await api.patch(`/users/${userId}`, payload)
  },
}