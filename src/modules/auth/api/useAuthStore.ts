import { create } from 'zustand'

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
  setUser: (user: User, token: string) => void
  logout: () => void
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
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
}))
