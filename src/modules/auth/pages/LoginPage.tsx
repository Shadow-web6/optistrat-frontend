import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/lib/api'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import logo from '@/assets/logo.jpeg'
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  UserCheck, 
  FolderKanban, 
  FileText, 
  UserRound, 
  Wallet,
  Eye,
  EyeOff,
  Mail,
  Lock
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setUser(data.user, data.token)
      navigate(data.user.role === 'client' ? '/mon-espace' : '/dashboard')
    } catch {
      setError('Identifiants invalides.')
    } finally {
      setLoading(false)
    }
  }

  const modules = [
    { name: 'OptiStrat Hub™', icon: LayoutDashboard },
    { name: 'OSD™ Platform', icon: Target },
    { name: 'CRM', icon: Users },
    { name: 'Collaborateurs', icon: UserCheck },
    { name: 'Projets', icon: FolderKanban },
    { name: 'OptiStrat Docs™', icon: FileText },
    { name: 'Client Portal™', icon: UserRound },
    { name: 'OptiStrat Finance™', icon: Wallet },
  ]

  return (
    <div className="flex min-h-screen w-full bg-navy-900">
      {/* Colonne de gauche : Présentation & Modules */}
      <div className="hidden lg:flex lg:w-3/5 flex-col justify-between p-12 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-2xl bg-navy p-3 shadow-lg">
            <img src={logo} alt="OptiStrat Group" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">OptiStrat OS</h1>
          <p className="mt-2 text-slate-300 font-medium">
            L'intelligence stratégique au service de votre performance
          </p>
        </div>

        {/* Grille des 8 modules */}
        <div className="my-8 grid grid-cols-2 gap-4 max-w-2xl mx-auto w-full px-4">
          {modules.map((mod, index) => {
            const Icon = mod.icon
            return (
              <div 
                key={index} 
                className="flex items-center gap-3 rounded-lg border border-navy-800 bg-navy-800/50 px-4 py-3 transition-all hover:bg-navy-800"
              >
                <div className="text-brand-500">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-slate-200">{mod.name}</span>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            Développé par <span className="font-semibold text-white">Anaël TCHIBOZO</span>
          </p>
        </div>
      </div>

      {/* Colonne de droite : Formulaire */}
      <div className="flex w-full lg:w-2/5 items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg border border-navy-800 bg-white p-8 shadow-xl">
          <div className="mb-6 flex justify-center lg:hidden">
            <img src={logo} alt="OptiStrat Group" className="h-16 w-16 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Bon retour !</h2>
            <p className="text-sm text-slate-500 mt-1">Connectez-vous à votre espace stratégique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail className="h-4 w-4" /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="h-4 w-4" /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-10 text-sm focus:border-brand-500 focus:outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}