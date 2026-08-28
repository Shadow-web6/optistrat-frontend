import { create } from 'zustand'
import { api } from '@/shared/lib/api'

export type Role = 'ceo' | 'executive_assistant' | 'business_developer' | 'designer' | 'consultant_analyst' | 'client'

interface User {
  id: number
  name: string
  email: string
  role: Role
  permissions: string[]
  must_change_password: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setUser: (user, token) => {
    localStorage.setItem('optistrat_token', token)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('optistrat_token')
    set({ user: null, isAuthenticated: false })
  },
  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false
    if (user.role === 'ceo') return true
    return user.permissions.includes(permission)
  },
  // Appelé une seule fois au démarrage de l'app : si un token existe déjà
  // dans le localStorage (cas d'un refresh de page), on revalide la session
  // auprès du backend au lieu de repartir sur un état "non connecté".
  bootstrap: async () => {
    const token = localStorage.getItem('optistrat_token')
    if (!token) {
      set({ isInitializing: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true, isInitializing: false })
    } catch {
      localStorage.removeItem('optistrat_token')
      set({ user: null, isAuthenticated: false, isInitializing: false })
    }
  },
}))