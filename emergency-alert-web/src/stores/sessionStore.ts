import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/utils/supabase'

export interface User {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER'
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
}

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setHasHydrated: (val: boolean) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        if (supabase) void supabase.auth.signOut()
        set({ user: null, isAuthenticated: false })
        localStorage.removeItem('eas-session')
      },
    }),
    {
      name: 'eas-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export async function hydrateSession() {
  return
}

