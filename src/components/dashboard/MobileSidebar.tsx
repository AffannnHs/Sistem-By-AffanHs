import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertOctagon, Cog, LayoutDashboard, Map, Monitor, Users, Wifi, X } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/live-map', label: 'Live Map', icon: Map },
  { to: '/dashboard/alerts', label: 'Alerts', icon: AlertOctagon },
  { to: '/dashboard/users', label: 'Users', icon: Users },
  { to: '/dashboard/devices', label: 'Devices', icon: Wifi },
  { to: '/dashboard/settings', label: 'Settings', icon: Cog },
]

export default function MobileSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const open = useUIStore((s) => s.mobileSidebarOpen)
  const setOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const user = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[140] bg-black/60" onMouseDown={() => setOpen(false)}>
      <div
        className="h-full w-[280px] border-r border-[var(--border)] bg-[var(--panel)] p-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">EAS</div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-1">
          {items.map((it) => {
            const active = it.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(it.to)
            const Icon = it.icon
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${active ? 'bg-[var(--card)] text-white' : 'text-slate-300 hover:bg-[var(--card)]'}`}
                onClick={() => setOpen(false)}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-red-400' : 'text-slate-300'}`} />
                <div className="flex-1">{it.label}</div>
                {it.to === '/dashboard/alerts' ? <div className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-200">3</div> : null}
                {it.to === '/dashboard/users' ? <div className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">2</div> : null}
              </Link>
            )
          })}
          <Link
            to="/dashboard/live-map/kiosk"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
              location.pathname === '/dashboard/live-map/kiosk' ? 'bg-[var(--card)] text-white' : 'text-slate-300 hover:bg-[var(--card)]'
            }`}
            onClick={() => setOpen(false)}
          >
            <Monitor className={`h-5 w-5 ${location.pathname === '/dashboard/live-map/kiosk' ? 'text-red-400' : 'text-slate-300'}`} />
            Kiosk Mode
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
          <div className="text-sm font-semibold text-white">{user?.name ?? 'Ahmad Fauzi'}</div>
          <div className="mt-1 text-xs text-slate-400">{user?.role ?? 'SUPER_ADMIN'}</div>
          <button
            className="mt-3 w-full rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
            onClick={async () => {
              await logout()
              setOpen(false)
              navigate('/login', { replace: true })
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}

