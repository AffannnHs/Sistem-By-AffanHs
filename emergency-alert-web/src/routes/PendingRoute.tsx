import { Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/stores/sessionStore'

import type React from 'react'

export default function PendingRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const user = useSessionStore((s) => s.user)
  const hydrated = useSessionStore((s) => s._hasHydrated)

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)] text-sm text-[var(--muted)]">
        Memuat...
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.status !== 'PENDING') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
