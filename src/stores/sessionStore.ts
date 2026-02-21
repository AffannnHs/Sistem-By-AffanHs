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
  clearUser: () => void
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
      clearUser: () => set({ user: null, isAuthenticated: false }),
      logout: () => {
        void supabase.auth.signOut()
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
    }
  )
)

export async function hydrateSession() {
  const setUser = useSessionStore.getState().setUser
  const clearUser = useSessionStore.getState().clearUser
  const setHasHydrated = useSessionStore.getState().setHasHydrated
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      clearUser()
      return
    }

    const authUser = session.user
    const userId = authUser.id

    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, role, status')
      .eq('id', userId)
      .maybeSingle()

    if (userErr) {
      clearUser()
      return
    }

    if (!userRow) {
      const name = (authUser.user_metadata?.name as string | undefined) ?? authUser.email ?? 'User'
      const email = authUser.email ?? '-'
      await supabase.from('users').insert({ id: userId, name, email, role: 'MEMBER', status: 'PENDING' })
      setUser({ id: userId, name, email, role: 'MEMBER', status: 'PENDING' })
      return
    }

    const rawStatus = (userRow.status ?? 'PENDING') as string
    if (rawStatus === 'REJECTED') {
      clearUser()
      void supabase.auth.signOut()
      return
    }

    setUser({
      id: userRow.id,
      name: userRow.name ?? authUser.email ?? 'User',
      email: userRow.email ?? authUser.email ?? '-',
      role: (userRow.role ?? 'MEMBER') as User['role'],
      status: (rawStatus ?? 'PENDING') as User['status'],
    })
  } finally {
    setHasHydrated(true)
  }
}
