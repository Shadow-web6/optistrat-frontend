export interface QuestionOption {
  id: number
  label: string
  score_value: number
}

export interface Question {
  id: number
  category: string
  label: string
  type: 'scale' | 'single_choice' | 'multiple_choice'
  weight: number
  options: QuestionOption[]
}

export interface Questionnaire {
  id: number
  title: string
  description: string | null
  is_active: boolean
  questions?: Question[]
}

export interface DiagnosticScore {
  category: string
  score: number
}

export interface DiagnosticRecommendation {
  category: string
  score: number
  recommendation: string | null
}

export interface Diagnostic {
  id: number
  status: 'draft' | 'completed'
  overall_score: number | null
  completed_at: string | null
  questionnaire: { id: number; title: string }
  prospect: { id: number; name: string } | null
  conducted_by?: { id: number; name: string }
  scores?: DiagnosticScore[]
  recommendations?: DiagnosticRecommendation[]
}
