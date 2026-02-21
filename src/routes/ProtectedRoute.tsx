import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/stores/sessionStore'

export default function ProtectedRoute() {
  const { isAuthenticated, user, _hasHydrated } = useSessionStore()
  const location = useLocation()

  if (!_hasHydrated) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f1117',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 48 }}>🚨</div>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Memuat sistem...</div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.status === 'PENDING') {
    return <Navigate to="/pending" replace />
  }

  return <Outlet />
}

