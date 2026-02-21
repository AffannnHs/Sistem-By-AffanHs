import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  AlertOctagon,
  BellRing,
  Cog,
  LayoutDashboard,
  Map,
  Monitor,
  Users,
  Wifi,
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed)
  const user = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-30 hidden h-screen border-r border-[var(--border)] bg-[var(--panel)] md:block',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-[60px] items-center justify-between px-4">
        <div className={cn('flex items-center gap-2', collapsed ? 'justify-center' : '')}>
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/15 text-red-200">
            <BellRing className="h-5 w-5" />
          </div>
          {!collapsed ? <div className="text-sm font-semibold">EAS Admin</div> : null}
        </div>
        {!collapsed ? (
          <button
            className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            onClick={() => setCollapsed(true)}
          >
            ◀
          </button>
        ) : (
          <button
            className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            onClick={() => setCollapsed(false)}
          >
            ▶
          </button>
        )}
      </div>

      <div className={cn('px-3', collapsed ? 'px-2' : '')}>
        <div className="mb-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {!collapsed ? <div className="text-xs text-slate-200">Sistem Online</div> : null}
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((it) => {
            const active = it.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(it.to)
            const Icon = it.icon
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-[var(--card)]',
                  active ? 'bg-[var(--card)] text-white' : '',
                  collapsed ? 'justify-center px-2' : '',
                )}
                title={collapsed ? it.label : undefined}
              >
                <div className={cn('h-5 w-1 rounded-full', active ? 'bg-red-500' : 'bg-transparent', collapsed ? 'hidden' : '')} />
                <Icon className={cn('h-5 w-5', active ? 'text-red-400' : 'text-slate-300')} />
                {!collapsed ? <div className="flex-1">{it.label}</div> : null}
                {!collapsed && it.to === '/dashboard/alerts' ? (
                  <div className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-200">3</div>
                ) : null}
                {!collapsed && it.to === '/dashboard/users' ? (
                  <div className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">2</div>
                ) : null}
              </Link>
            )
          })}
          <Link
            to="/dashboard/live-map/kiosk"
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-[var(--card)]',
              location.pathname === '/dashboard/live-map/kiosk' ? 'bg-[var(--card)] text-white' : '',
              collapsed ? 'justify-center px-2' : '',
            )}
            title={collapsed ? 'Kiosk Mode' : undefined}
          >
            <div className={cn('h-5 w-1 rounded-full', location.pathname === '/dashboard/live-map/kiosk' ? 'bg-red-500' : 'bg-transparent', collapsed ? 'hidden' : '')} />
            <Monitor className={cn('h-5 w-5', location.pathname === '/dashboard/live-map/kiosk' ? 'text-red-400' : 'text-slate-300')} />
            {!collapsed ? <div className="flex-1">Kiosk Mode</div> : null}
          </Link>
        </nav>

        {!collapsed ? (
          <div className="absolute bottom-4 left-3 right-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">
                {(user?.name ?? 'AF')
                  .split(' ')
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{user?.name ?? 'Ahmad Fauzi'}</div>
                <div className="text-xs text-slate-400">{user?.role ?? 'SUPER_ADMIN'}</div>
              </div>
            </div>
            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15"
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
            >
              🚪 Logout
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

