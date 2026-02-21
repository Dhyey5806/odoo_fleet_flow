import { create } from 'zustand'

export type UserRole = 'admin' | 'manager' | 'dispatcher' | 'driver'

export interface User {
  id: number | string
  name?: string
  email: string
  role: string  // Backend returns 'Manager' | 'Dispatcher'
  organizationId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (token: string, user: User) => {
    set({ token, user, isAuthenticated: !!user })
  },

  login: async () => {
    // Login is handled by LoginPage via API; setAuth is called with result
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
  },

  register: async () => {
    // Register is handled by LoginPage via API; setAuth is called with result
  }
}))
