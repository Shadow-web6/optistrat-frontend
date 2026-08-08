import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import logo from '@/assets/logo.jpeg'
import {
  ClipboardList,
  FileText,
  Briefcase,
  HelpCircle,
} from 'lucide-react'

const NAV = [
  { to: '/mon-espace', label: 'Mes diagnostics', icon: ClipboardList },
  { to: '/mon-espace/documents', label: 'Mes documents', icon: FileText },
  { to: '/mon-espace/projets', label: 'Mes missions', icon: Briefcase },
  { to: '/mon-espace/demandes', label: 'Mes demandes', icon: HelpCircle },
]

export function ClientPortalLayout() {
  const { user, logout } = useAuthStore()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-navy-800">
        <div className="flex items-center gap-2 px-5 py-5 shrink-0">
          <img src={logo} alt="OptiStrat" className="h-10 w-10 object-contain" />
          <span className="text-sm font-semibold text-white">Espace client</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/mon-espace'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-navy-700 text-brand-500'
                      : 'text-navy-100/80 hover:bg-navy-700 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-navy-700 p-4 shrink-0">
          <p className="text-center text-xs text-gray-400">
            Développé par{" "}
            <span className="font-medium text-gray-200">
              Anaël TCHIBOZO
            </span>
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-4 border-b border-slate-200 bg-white px-6">
          <p className="text-sm font-medium text-slate-700">{user?.name}</p>
          <Link to="/change-password" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Mot de passe
          </Link>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Déconnexion
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}