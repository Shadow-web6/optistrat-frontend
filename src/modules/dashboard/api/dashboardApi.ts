import { api } from '@/shared/lib/api'
import type { DashboardStats } from '../types'

export const dashboardApi = {
  get: async () => {
    const { data } = await api.get<{ data: DashboardStats }>('/dashboard')
    return data.data
  },
}