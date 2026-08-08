import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import logo from '@/assets/logo.jpeg'
import {
  LayoutDashboard,
  Users,
  Target,
  UserCheck,
  FolderKanban,
  FileText,
  Briefcase,
  Wallet,
  UserCog,
  GraduationCap,
  Calendar,
  TrendingUp ,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Tableau de bord', permission: null, icon: LayoutDashboard },
  { to: '/crm', label: 'CRM', permission: 'crm.view', icon: Users },
  { to: '/crm/pipeline', label: 'Pipeline commercial', permission: 'crm.view', icon: TrendingUp },
  { to: '/osd', label: 'Diagnostic OSD', permission: 'osd.view', icon: Target },
  { to: '/hr', label: 'Collaborateurs', permission: 'hr.view', icon: UserCheck },
  { to: '/projects', label: 'Projets', permission: 'projects.view', icon: FolderKanban },
  { to: '/ged', label: 'Documents', permission: 'ged.view', icon: FileText },
  { to: '/portal', label: 'Demandes clients', permission: 'crm.view', icon: Briefcase },
  { to: '/finance', label: 'Finance', permission: 'finance.view', icon: Wallet },
  { to: '/users', label: 'Comptes utilisateurs', permission: 'users.manage', icon: UserCog },
  { to: '/academy', label: 'Academy', permission: null, icon: GraduationCap },
  { to: '/events', label: 'Événements', permission: null, icon: Calendar },
]

const ROLE_LABEL: Record<string, string> = {
  ceo: 'CEO / Administrateur',
  executive_assistant: 'Assistante Exécutive',
  business_developer: 'Business Developer',
  designer: 'Designer Graphique',
  consultant_analyst: 'Consultant Analyste',
  client: 'Client',
}

export function AppLayout() {
  const { user, logout, hasPermission } = useAuthStore()

  const visibleNav = NAV.filter((item) => item.permission === null || hasPermission(item.permission))

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar corrigée : sticky, hauteur de l'écran, flex column avec sections fixes haut/bas et milieu scrollable */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-navy-800">
        <div className="flex items-center gap-2 px-5 py-5 shrink-0">
          <img src={logo} alt="OptiStrat" className="h-10 w-10 object-contain" />
          <span className="text-sm font-semibold text-white">OptiStrat OS</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
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
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
            <p className="text-xs text-slate-400">{user ? ROLE_LABEL[user.role] : ''}</p>
          </div>
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

/*import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/modules/auth/api/useAuthStore'
import logo from '@/assets/logo.jpeg'

const NAV = [
  { to: '/dashboard', label: 'Tableau de bord', permission: null },
  { to: '/crm', label: 'CRM', permission: 'crm.view' },
  { to: '/osd', label: 'Diagnostic OSD', permission: 'osd.view' },
  { to: '/hr', label: 'Collaborateurs', permission: 'hr.view' },
  { to: '/projects', label: 'Projets', permission: 'projects.view' },
  { to: '/ged', label: 'Documents', permission: 'ged.view' },
  { to: '/portal', label: 'Demandes clients', permission: 'crm.view' },
  { to: '/finance', label: 'Finance', permission: 'finance.view' },
  { to: '/users', label: 'Comptes utilisateurs', permission: 'users.manage' },
  { to: '/academy', label: 'Academy', permission: null },
  { to: '/events', label: 'Événements', permission: null },
]

const ROLE_LABEL: Record<string, string> = {
  ceo: 'CEO / Administrateur',
  executive_assistant: 'Assistante Exécutive',
  business_developer: 'Business Developer',
  designer: 'Designer Graphique',
  consultant_analyst: 'Consultant Analyste',
  client: 'Client',
}

export function AppLayout() {
  const { user, logout, hasPermission } = useAuthStore()

  const visibleNav = NAV.filter((item) => item.permission === null || hasPermission(item.permission))

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex h-screen w-64 shrink-0 flex-col bg-navy-800">
        <div className="flex items-center gap-2 px-5 py-5">
          <img src={logo} alt="OptiStrat" className="h-10 w-10 object-contain" />
          <span className="text-sm font-semibold text-white">OptiStrat OS</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-navy-700 text-brand-500'
                    : 'text-navy-100/80 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-navy-700 p-4">
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
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
            <p className="text-xs text-slate-400">{user ? ROLE_LABEL[user.role] : ''}</p>
          </div>
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
}*/