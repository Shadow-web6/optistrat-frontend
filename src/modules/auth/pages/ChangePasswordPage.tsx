import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/lib/api'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import logo from '@/assets/logo.jpeg'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })

      const token = localStorage.getItem('optistrat_token')
      if (user && token) {
        setUser({ ...user, must_change_password: false }, token)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.errors?.current_password?.[0] ?? 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-navy-800 bg-white p-8 shadow-xl"
      >
        <div className="mb-4 flex justify-center">
          <img src={logo} alt="OptiStrat Group" className="h-20 w-20 object-contain" />
        </div>
        <p className="mb-6 text-center text-sm text-slate-600">
          Pour continuer, choisis un nouveau mot de passe.
        </p>

        <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe actuel</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          required
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          required
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          required
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement…' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  )
}