import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Siren } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { useToastStore } from '@/stores/toastStore'
import { supabase } from '@/utils/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const setUser = useSessionStore((s) => s.setUser)
  const pushToast = useToastStore((s) => s.push)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoadingUI] = useState(false)

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!canSubmit) return
    setLoadingUI(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError || !authData.user) {
        setError('Email atau password salah. Silakan coba lagi.')
        return
      }

      const userId = authData.user.id
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role, status')
        .eq('id', userId)
        .maybeSingle()

      if (userError) {
        setError('Gagal mengambil data user. Silakan coba lagi.')
        return
      }

      if (!userRow) {
        const name = (authData.user.user_metadata?.name as string | undefined) ?? authData.user.email ?? 'User'
        const userEmail = authData.user.email ?? '-'
        await supabase.from('users').insert({ id: userId, name, email: userEmail, role: 'MEMBER', status: 'PENDING' })
        setUser({ id: userId, name, email: userEmail, role: 'MEMBER', status: 'PENDING' })
        pushToast({ type: 'info', title: 'Akun terdaftar', message: 'Akun Anda menunggu persetujuan.', durationMs: 5000 })
        navigate('/pending', { replace: true })
        return
      }

      const rawStatus = (userRow.status ?? 'PENDING') as string
      if (rawStatus === 'REJECTED') {
        setError('Pendaftaran Anda ditolak. Hubungi administrator.')
        await supabase.auth.signOut()
        return
      }

      const nextUser = {
        id: userRow.id,
        name: userRow.name ?? authData.user.email ?? 'User',
        email: userRow.email ?? authData.user.email ?? '-',
        role: (userRow.role ?? 'MEMBER') as 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER',
        status: (rawStatus ?? 'PENDING') as 'ACTIVE' | 'PENDING' | 'SUSPENDED',
      }

      setUser(nextUser)

      if (nextUser.status === 'PENDING') {
        const { data: boot } = await supabase.rpc('bootstrap_first_super_admin')
        if (boot) {
          const { data: promoted } = await supabase
            .from('users')
            .select('id, name, email, role, status')
            .eq('id', userId)
            .maybeSingle()
          if (promoted && promoted.status === 'ACTIVE') {
            setUser({
              id: promoted.id,
              name: promoted.name ?? authData.user.email ?? 'User',
              email: promoted.email ?? authData.user.email ?? '-',
              role: (promoted.role ?? 'SUPER_ADMIN') as 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER',
              status: 'ACTIVE',
            })
            pushToast({ type: 'success', title: 'Bootstrap admin', message: '✅ Akun pertama diaktifkan sebagai SUPER_ADMIN.', durationMs: 6000 })
            navigate(next, { replace: true })
            return
          }
        }
        pushToast({ type: 'info', title: 'Menunggu persetujuan', message: 'Akun Anda masih PENDING.', durationMs: 5000 })
        navigate('/pending', { replace: true })
        return
      }

      if (nextUser.status === 'SUSPENDED') {
        setError('Akun Anda ditangguhkan. Hubungi administrator.')
        await supabase.auth.signOut()
        return
      }

      pushToast({ type: 'success', title: 'Login berhasil', message: 'Sesi Supabase aktif.', durationMs: 5000 })
      navigate(next, { replace: true })
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoadingUI(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-red-500/15 blur-xl" />
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-red-500/15 text-red-200">
              <Siren className="h-8 w-8" />
            </div>
          </div>
          <div className="mt-4 text-lg font-semibold">EMERGENCY ALERT SYSTEM</div>
          <div className="text-sm text-slate-300">Admin Control Panel</div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl animate-[fade-in_0.35s_ease-out]">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-300">Email Address</div>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@emergency.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-300">Password</div>
              <div className="relative">
                <input
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 pr-10 text-sm text-white outline-none focus:ring-2 focus:ring-red-500/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-300 hover:bg-white/10"
                  onClick={() => setShow((v) => !v)}
                  aria-label="Toggle password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              className="h-11 w-full rounded-xl bg-red-500 px-4 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
              disabled={!canSubmit || loading}
            >
              {loading ? 'Memproses...' : '🔐 LOGIN SEKARANG'}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">v1.0.0 — Secure Access</div>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400">
          ⚠️ Akses terbatas untuk personel terotorisasi
        </div>
      </div>
    </div>
  )
}

