import { api } from '@/shared/lib/api'
import type { ClientRequest } from '../types'

export const portalApi = {
  // Côté cabinet : inbox des demandes clients
  listRequests: async (status?: string) => {
    const { data } = await api.get<{ data: ClientRequest[] }>('/crm/client-requests', {
      params: status ? { status } : undefined,
    })
    return data.data
  },

  reply: async (requestId: number, payload: { reply: string; status: string }) => {
    const { data } = await api.patch<{ data: ClientRequest }>(
      `/crm/client-requests/${requestId}/reply`,
      payload
    )
    return data.data
  },

  // Côté client : ses propres données
  myDiagnostics: async () => {
    const { data } = await api.get('/portal/diagnostics')
    return data.data
  },

  myDocuments: async () => {
    const { data } = await api.get('/portal/documents')
    return data.data
  },

  myProjects: async () => {
    const { data } = await api.get('/portal/projects')
    return data.data
  },

  myRequests: async () => {
    const { data } = await api.get<{ data: ClientRequest[] }>('/portal/requests')
    return data.data
  },

  sendRequest: async (payload: { subject: string; message: string }) => {
    const { data } = await api.post<{ data: ClientRequest }>('/portal/requests', payload)
    return data.data
  },

}