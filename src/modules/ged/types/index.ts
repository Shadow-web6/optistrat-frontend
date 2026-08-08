export interface DocumentVersion {
  version_number: number
  original_name: string
  file_size: number | null
  mime_type: string | null
  uploaded_at: string
}

export interface Document {
  id: number
  title: string
  description: string | null
  category: { id: number; name: string } | null
  project: { id: number; name: string } | null
  uploaded_by: { id: number; name: string }
  latest_version: DocumentVersion | null
  versions_count: number
  is_favorite: boolean
  created_at: string
}

export interface DocumentCategory {
  id: number
  name: string
  parent_id: number | null
}