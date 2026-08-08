import { api } from '@/shared/lib/api'
import type { Prospect, TeamMember, Interaction, PipelineStage, Opportunity } from '../types'

export const crmApi = {
  list: async (status?: 'prospect' | 'client') => {
    const { data } = await api.get<{ data: Prospect[] }>('/crm/prospects', {
      params: status ? { status } : undefined,
    })
    return data.data
  },

  get: async (id: number) => {
    const { data } = await api.get<{ data: Prospect }>(`/crm/prospects/${id}`)
    return data.data
  },

  create: async (payload: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
    status?: string
    assigned_to?: number
  }) => {
    const { data } = await api.post<{ data: Prospect }>('/crm/prospects', payload)
    return data.data
  },

  createPortalAccess: async (prospectId: number) => {
    const { data } = await api.post<{ message: string; email: string; temporary_password?: string }>(
      `/crm/prospects/${prospectId}/portal-access`
    )
    return data
  },

  assignableUsers: async () => {
    const { data } = await api.get<{ data: TeamMember[] }>('/crm/assignable-users')
    return data.data
  },

  addInteraction: async (
    prospectId: number,
    payload: { type: string; content: string; reminder_at?: string }
  ) => {
    const { data } = await api.post<{ data: Interaction }>(
      `/crm/prospects/${prospectId}/interactions`,
      payload
    )
    return data.data
  },

  listPipelineStages: async () => {
    const { data } = await api.get<{ data: PipelineStage[] }>('/crm/pipeline-stages')
    return data.data
  },

  listOpportunities: async () => {
    const { data } = await api.get<{ data: Opportunity[] }>('/crm/opportunities')
    return data.data
  },

  createOpportunity: async (payload: {
    prospect_id: number
    pipeline_stage_id: number
    title: string
    estimated_value?: number
  }) => {
    const { data } = await api.post<{ data: Opportunity }>('/crm/opportunities', payload)
    return data.data
  },

  moveOpportunity: async (opportunityId: number, pipelineStageId: number) => {
    const { data } = await api.patch<{ data: Opportunity }>(
      `/crm/opportunities/${opportunityId}/move`,
      { pipeline_stage_id: pipelineStageId }
    )
    return data.data
  },
}