import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Keyboard, Menu, UserCircle2 } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useSessionStore } from '@/stores/sessionStore'

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
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">5</span>
            </button>
            {bellOpen ? (
              <div className="absolute right-0 top-11 w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                {[
                  { t: '🔥 Alert kebakaran baru — Cibinong', s: '2 mnt lalu' },
                  { t: '👤 Rudi Hermawan menunggu approval', s: '15 mnt lalu' },
                  { t: '✅ Alert medis diselesaikan', s: '1 jam lalu' },
                ].map((n) => (
                  <div key={n.t} className="rounded-xl px-3 py-2 hover:bg-white/10">
                    <div className="text-sm text-slate-200">{n.t}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{n.s}</div>
                  </div>
                ))}
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
                <Link to="/dashboard/settings" className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
                  ⚙️ Pengaturan
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

