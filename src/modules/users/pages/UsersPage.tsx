import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

const ROLE_LABEL: Record<string, string> = {
  ceo: 'CEO / Administrateur',
  executive_assistant: 'Assistante Exécutive',
  business_developer: 'Business Developer',
  designer: 'Designer Graphique',
  consultant_analyst: 'Consultant Analyste',
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', role: 'consultant_analyst' })
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  })

  // Extraction sécurisée de la liste des utilisateurs (gère { data: [...] } ou un tableau direct)
  const users: any[] = Array.isArray(responseData) 
    ? responseData 
    : (responseData as any)?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => usersApi.create(form),
    onSuccess: (result: any) => {
      setErrorMessage(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['collaborators'] }) // Rafraîchit aussi la liste des collaborateurs
      // Récupération sécurisée du mot de passe temporaire qu'il vienne de .temporary_password ou .password
      setCreated({ 
        email: result?.email || form.email, 
        password: result?.temporary_password || result?.password || 'Généré avec succès' 
      })
      setForm({ name: '', email: '', role: 'consultant_analyst' })
    },
    onError: (error: any) => {
      // Affichage de l'erreur renvoyée par Laravel (ex: email déjà pris)
      const message = error?.response?.data?.message || 'Erreur lors de la création du compte. Vérifie les informations.'
      setErrorMessage(message)
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      usersApi.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Comptes collaborateurs</h1>
        <p className="mt-1 text-sm text-slate-500">Créer et gérer les accès du personnel du cabinet.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouveau compte</h2>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom complet"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            type="email"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {Object.entries(ROLE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button
          disabled={!form.name || !form.email || createMutation.isPending}
          onClick={() => {
            setErrorMessage(null)
            createMutation.mutate()
          }}
          className="mt-3 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {createMutation.isPending ? 'Création…' : 'Créer le compte'}
        </button>

        {/* Message d'erreur éventuel */}
        {errorMessage && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        {/* Message de succès avec le mot de passe temporaire */}
        {created && (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Compte créé — Email : <strong>{created.email}</strong> — Mot de passe temporaire : <strong>{created.password}</strong>
            <br />
            <span className="text-xs text-emerald-600">À transmettre au collaborateur par un canal sécurisé.</span>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
            Développé par{" "}
          <span className="font-medium text-gray">
            Anaël TCHIBOZO
          </span>
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <p className="p-5 text-sm text-slate-500">Chargement…</p>
        ) : users.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Aucun compte utilisateur enregistré.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase text-slate-400 bg-slate-50">
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rôle</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3 text-slate-600">{u.role ? ROLE_LABEL[u.role] : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {u.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: u.id, is_active: !u.is_active })}
                      className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline"
                    >
                      {u.is_active ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}