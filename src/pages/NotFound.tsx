import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6">
      <div className="w-full max-w-[520px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="mt-5 text-2xl font-semibold">404 — Halaman Tidak Ditemukan</div>
        <div className="mt-2 text-sm text-slate-300">Halaman yang Anda cari tidak ada atau telah dipindahkan.</div>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}

