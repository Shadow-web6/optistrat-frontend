import { api } from '@/shared/lib/api'
import type { Document, DocumentCategory } from '../types'

export const gedApi = {
  list: async (params?: { search?: string; category_id?: number; favorites_only?: boolean }) => {
    const { data } = await api.get<{ data: Document[] }>('/ged/documents', { params })
    return data.data
  },

  listCategories: async () => {
    const { data } = await api.get<{ data: DocumentCategory[] }>('/ged/categories')
    return data.data
  },

  upload: async (payload: {
    title: string
    description?: string
    category_id?: number
    project_id?: number
    client_id?: number
    file: File
  }) => {
    const form = new FormData()
    form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.category_id) form.append('category_id', String(payload.category_id))
    if (payload.project_id) form.append('project_id', String(payload.project_id))
    if (payload.client_id) form.append('client_id', String(payload.client_id))
    form.append('file', payload.file)

    const { data } = await api.post<{ data: Document }>('/ged/documents', form)
    return data.data
  },

  createCategory: async (name: string) => {
    const { data } = await api.post<{ data: DocumentCategory }>('/ged/categories', { name })
    return data.data
  },

  toggleFavorite: async (documentId: number) => {
    const { data } = await api.post<{ is_favorite: boolean }>(`/ged/documents/${documentId}/favorite`)
    return data.is_favorite
  },

  downloadUrl: (documentId: number) => {
    return `${api.defaults.baseURL}/ged/documents/${documentId}/download`
  },
}