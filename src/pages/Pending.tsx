import { useSessionStore } from '@/stores/sessionStore'

export default function Pending() {
  const user = useSessionStore((s) => s.user)
  const logout = useSessionStore((s) => s.logout)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-lg font-semibold">Akun Anda Menunggu Persetujuan</div>
        <div className="mt-2 text-sm text-[var(--muted)]">
          Halo {user?.name ?? 'User'}, akun Anda masih berstatus <span className="font-semibold text-yellow-200">PENDING</span>.
          Silakan tunggu Super Admin menyetujui pendaftaran.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="h-10 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15"
            onClick={() => window.location.reload()}
          >
            Cek Lagi
          </button>
          <button
            className="h-10 rounded-xl border border-red-500/40 bg-red-500/10 px-4 text-sm font-semibold text-red-200 hover:bg-red-500/15"
            onClick={() => void logout()}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

