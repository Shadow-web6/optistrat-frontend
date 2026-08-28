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

    listActiveQuestionnaires: async () => {
    const { data } = await api.get('/portal/diagnostics/questionnaires')
    return data.data
  },

  getQuestionnaire: async (id: number) => {
    const { data } = await api.get(`/portal/diagnostics/questionnaires/${id}`)
    return data.data
  },

  startDiagnostic: async (questionnaireId: number) => {
    const { data } = await api.post('/portal/diagnostics/start', { questionnaire_id: questionnaireId })
    return data.data
  },

  getMyDiagnostic: async (id: number) => {
    const { data } = await api.get(`/portal/diagnostics/${id}`)
    return data.data
  },

  submitMyDiagnostic: async (
    diagnosticId: number,
    answers: { question_id: number; question_option_id?: number; score_value: number }[]
  ) => {
    const { data } = await api.post(`/portal/diagnostics/${diagnosticId}/submit`, { answers })
    return data.data
  },

}