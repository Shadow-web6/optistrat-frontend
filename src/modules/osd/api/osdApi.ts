import { api } from '@/shared/lib/api'
import type { Diagnostic, Questionnaire } from '../types'

export const osdApi = {
  listQuestionnaires: async () => {
    const { data } = await api.get<{ data: Questionnaire[] }>('/osd/questionnaires')
    return data.data
  },

  getQuestionnaire: async (id: number) => {
    const { data } = await api.get<{ data: Questionnaire }>(`/osd/questionnaires/${id}`)
    return data.data
  },

  listDiagnostics: async (prospectId?: number) => {
    const { data } = await api.get<{ data: Diagnostic[] }>('/osd/diagnostics', {
      params: prospectId ? { prospect_id: prospectId } : undefined,
    })
    return data.data
  },

  getDiagnostic: async (id: number) => {
    const { data } = await api.get<{ data: Diagnostic }>(`/osd/diagnostics/${id}`)
    return data.data
  },

  startDiagnostic: async (payload: { questionnaire_id: number; prospect_id?: number }) => {
    const { data } = await api.post<{ data: Diagnostic }>('/osd/diagnostics', payload)
    return data.data
  },

  submitDiagnostic: async (
    diagnosticId: number,
    answers: { question_id: number; question_option_id?: number; score_value: number }[]
  ) => {
    const { data } = await api.post<{ data: Diagnostic }>(
      `/osd/diagnostics/${diagnosticId}/submit`,
      { answers }
    )
    return data.data
  },

  downloadPdfUrl: (diagnosticId: number) => {
    const base = api.defaults.baseURL
    return `${base}/osd/diagnostics/${diagnosticId}/pdf`
  },
}
