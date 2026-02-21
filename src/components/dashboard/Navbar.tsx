import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Keyboard, Menu, UserCircle2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useNotifications } from '@/hooks/useNotifications'

function notifIcon(type: string) {
  if (type === 'ALERT_NEW') return '🚨'
  if (type === 'USER_PENDING') return '👤'
  if (type === 'ALERT_RESOLVED') return '✅'
  return '📡'
}

function fromNowLabel(iso: string) {
  const t = new Date(iso).getTime()
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000))
  if (s < 60) return `${s} dtk lalu`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} mnt lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  return `${d} hari lalu`
}

function titleFromPath(pathname: string) {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/dashboard/live-map')) return 'Live Map'
  if (pathname.startsWith('/dashboard/alerts')) return 'Alerts'
  if (pathname.startsWith('/dashboard/users')) return 'Users'
  if (pathname.startsWith('/dashboard/devices')) return 'Devices'
  if (pathname.startsWith('/dashboard/settings')) return 'Settings'
  return 'Dashboard'
}

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen)
  const user = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)
  const { notifications, unreadCount, markAllRead } = useNotifications()

  const [bellOpen, setBellOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false)
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div className="sticky top-0 z-20 h-[60px] border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-200 hover:bg-white/10 md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="text-sm font-semibold text-slate-100">{titleFromPath(location.pathname)}</div>
            <div className="text-xs text-slate-400">/dashboard{location.pathname.replace('/dashboard', '') || ''}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-200 md:flex">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Sistem Online
          </div>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/5 px-3 text-sm text-slate-200 hover:bg-white/10"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="h-4 w-4" />
            <span className="hidden md:inline">Shortcut</span>
          </button>

          <div className="relative" ref={bellRef}>
            <button
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-200 hover:bg-white/10"
              onClick={() => {
                setBellOpen((v) => !v)
                setUserOpen(false)
              }}
              aria-label="Notifikasi"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {bellOpen ? (
              <div className="absolute right-0 top-11 w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                {notifications.length === 0 ? (
                  <div className="rounded-xl px-3 py-6 text-center">
                    <div className="text-3xl">🎉</div>
                    <div className="mt-2 text-sm text-slate-200">Tidak ada notifikasi</div>
                    <div className="mt-1 text-xs text-slate-400">Semua aman saat ini</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className={`mt-1 w-full rounded-xl px-3 py-2 text-left hover:bg-white/10 ${n.read ? '' : 'bg-white/5'}`}
                      onClick={() => {
                        markAllRead()
                        setBellOpen(false)
                        navigate(n.link)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-lg">{notifIcon(n.type)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-200">{n.title}</div>
                          <div className="mt-0.5 text-xs text-slate-400">{n.message}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{fromNowLabel(n.created_at)}</div>
                        </div>
                        {!n.read ? <div className="mt-2 h-2 w-2 flex-none rounded-full bg-red-500" /> : null}
                      </div>
                    </button>
                  ))
                )}
                <div className="my-2 h-px bg-white/10" />
                <Link to="/dashboard/alerts" className="block rounded-xl px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-white/10">
                  Lihat Semua Notifikasi
                </Link>
              </div>
            ) : null}
          </div>

          <div className="relative" ref={userRef}>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/5 px-3 text-sm text-slate-200 hover:bg-white/10"
              onClick={() => {
                setUserOpen((v) => !v)
                setBellOpen(false)
              }}
            >
              <UserCircle2 className="h-5 w-5" />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-100">{user?.name ?? 'Ahmad Fauzi'}</div>
                <div className="text-[11px] text-slate-400">{user?.role ?? 'SUPER_ADMIN'}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-300" />
            </button>
            {userOpen ? (
              <div className="absolute right-0 top-11 w-52 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                <Link to="/dashboard/users" className="block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                  👤 Profil
                </Link>
                <button
                  className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-red-200 hover:bg-red-500/10"
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
      </div>
    </div>
  )
}

