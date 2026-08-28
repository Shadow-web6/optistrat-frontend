import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { osdApi } from '../api/osdApi'

export default function DiagnosticDetailPage() {
  const { id } = useParams<{ id: string }>()
  const diagnosticId = Number(id)
  const queryClient = useQueryClient()

  const { data: diagnostic, isLoading } = useQuery({
    queryKey: ['osd', 'diagnostics', diagnosticId],
    queryFn: () => osdApi.getDiagnostic(diagnosticId),
  })

  // La question complète (avec options) n'est disponible que via le
  // questionnaire d'origine, chargé séparément pour le formulaire.
  const { data: questionnaire } = useQuery({
    queryKey: ['osd', 'questionnaires', diagnostic?.questionnaire.id],
    queryFn: () => osdApi.getQuestionnaire(diagnostic!.questionnaire.id),
    enabled: !!diagnostic && diagnostic.status === 'draft',
  })

  const [answers, setAnswers] = useState<Record<number, { option_id: number; score: number }>>({})

  const submitMutation = useMutation({
    mutationFn: () =>
      osdApi.submitDiagnostic(
        diagnosticId,
        Object.entries(answers).map(([questionId, a]) => ({
          question_id: Number(questionId),
          question_option_id: a.option_id,
          score_value: a.score,
        }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['osd', 'diagnostics'] })
      queryClient.invalidateQueries({ queryKey: ['osd', 'diagnostics', diagnosticId] })
    },
  })

  if (isLoading || !diagnostic) {
    return <p className="text-sm text-slate-500">Chargement…</p>
  }

  if (diagnostic.status === 'completed') {
    const chartData = diagnostic.scores?.map((s) => ({ category: s.category, score: s.score })) ?? []

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">{diagnostic.questionnaire.title}</h1>
            <p className="text-sm text-slate-500">
              {diagnostic.prospect?.name ?? 'Diagnostic interne'} — Score global :{' '}
              <span className="font-semibold text-brand-700">
                {diagnostic.overall_score?.toFixed(1)} / 10
              </span>
            </p>
          </div>
          <button
            onClick={() => osdApi.downloadDiagnosticPdf(diagnostic.id, `diagnostic-${diagnostic.id}.pdf`, true)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Télécharger le PDF
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar dataKey="score" stroke="#6d28d9" fill="#6d28d9" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white">
          <h2 className="border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            Recommandations
          </h2>
          <div className="space-y-3 p-5">
            {diagnostic.recommendations
              ?.filter((r) => r.recommendation)
              .map((r) => (
                <div key={r.category} className="border-l-2 border-brand-500 bg-slate-50 p-3 text-sm">
                  <span className="font-medium text-slate-800">
                    {r.category} ({r.score.toFixed(1)}/10)
                  </span>
                  <p className="mt-1 text-slate-600">{r.recommendation}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // --- Formulaire de passation (statut "draft") ---
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-800">{diagnostic.questionnaire.title}</h1>

      {!questionnaire ? (
        <p className="text-sm text-slate-500">Chargement du questionnaire…</p>
      ) : (
        <div className="space-y-5">
          {questionnaire.questions?.map((q) => (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-1 text-xs font-medium uppercase text-brand-600">{q.category}</p>
              <p className="mb-3 text-sm text-slate-800">{q.label}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { option_id: opt.id, score: opt.score_value },
                      }))
                    }
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      answers[q.id]?.option_id === opt.id
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            disabled={
              submitMutation.isPending ||
              Object.keys(answers).length !== (questionnaire.questions?.length ?? 0)
            }
            onClick={() => submitMutation.mutate()}
            className="w-full rounded-md bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitMutation.isPending ? 'Calcul du score…' : 'Valider le diagnostic'}
          </button>
        </div>
      )}
    </div>
  )
}
