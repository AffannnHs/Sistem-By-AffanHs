import { useEffect, useMemo, useState } from 'react'
import OverlayModal from '@/components/OverlayModal'
import { useToastStore } from '@/stores/toastStore'
import { pendingUsers as seed } from '@/mock/data'
import type { PendingUser, UserRole } from '@/mock/types'

const groups = ['Grup Cibinong', 'Grup Sentul', 'Grup Depok', 'Grup Bogor Kota'] as const

export default function PendingUsers() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PendingUser[]>(seed)
  const [removing, setRemoving] = useState<Record<string, boolean>>({})

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [active, setActive] = useState<PendingUser | null>(null)
  const [group, setGroup] = useState<(typeof groups)[number]>('Grup Cibinong')
  const [role, setRole] = useState<UserRole>('MEMBER')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  const count = items.length

  const onRemove = (id: string, after: () => void) => {
    setRemoving((r) => ({ ...r, [id]: true }))
    window.setTimeout(() => {
      setItems((x) => x.filter((u) => u.id !== id))
      setRemoving((r) => {
        const next = { ...r }
        delete next[id]
        return next
      })
      after()
    }, 350)
  }

  const activeLabel = useMemo(() => (active ? `${active.name} (${active.email})` : ''), [active])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-100">👥 Pending Approval</div>
          <div className="text-sm text-slate-300">Kelola pendaftar baru sebelum bisa akses sistem.</div>
        </div>
        <div className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-200">{count} Menunggu</div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
            <option>Semua</option>
          </select>
          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">
            <option>Urutkan: Terbaru</option>
          </select>
          <div className="flex-1" />
          <input
            data-search
            className="h-10 w-[180px] rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="🔍"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full rounded-2xl" />
          <div className="skeleton h-24 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center">
          <div className="text-5xl">✅</div>
          <div className="mt-3 text-lg font-semibold text-white">Semua Pendaftar Sudah Diproses</div>
          <div className="mt-1 text-sm text-slate-300">Tidak ada yang menunggu approval saat ini</div>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((u) => (
            <div
              key={u.id}
              className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 transition-all ${
                removing[u.id] ? 'opacity-0 -translate-y-1' : 'opacity-100'
              }`}
              style={{ transitionDuration: '350ms' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-sm font-bold text-white">
                    {u.name
                      .split(' ')
                      .slice(0, 2)
                      .map((x) => x[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{u.name}</div>
                    <div className="text-sm text-slate-300">{u.email}</div>
                    <div className="mt-1 text-sm text-slate-300">📱 {u.phone}</div>
                    <div className="mt-1 text-sm text-slate-300">📍 {u.location}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">🕐 {u.timeLabel}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <button
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                  onClick={() => {
                    setActive(u)
                    setApproveOpen(true)
                    setGroup('Grup Cibinong')
                    setRole('MEMBER')
                  }}
                >
                  ✅ Approve & Assign Grup
                </button>
                <button
                  className="rounded-xl border border-red-500/50 bg-transparent px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
                  onClick={() => {
                    setActive(u)
                    setRejectOpen(true)
                  }}
                >
                  ❌ Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OverlayModal
        open={approveOpen && !!active}
        title="✅ Approve Pendaftar Baru"
        onClose={() => {
          setApproveOpen(false)
          setActive(null)
        }}
        widthClassName="w-[560px]"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-slate-200">Nama : <span className="font-semibold text-white">{active?.name}</span></div>
            <div className="text-sm text-slate-200">Email : <span className="font-semibold text-white">{active?.email}</span></div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Pilih Grup</div>
            <select
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={group}
              onChange={(e) => setGroup(e.target.value as (typeof groups)[number])}
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-slate-300">Pilih Role</div>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <input type="radio" checked={role === 'MEMBER'} onChange={() => setRole('MEMBER')} /> Member
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                <input type="radio" checked={role === 'COORDINATOR'} onChange={() => setRole('COORDINATOR')} /> Coordinator
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              onClick={() => {
                setApproveOpen(false)
                setActive(null)
              }}
            >
              Batal
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                const cur = active
                if (!cur) return
                setApproveOpen(false)
                onRemove(cur.id, () => {
                  pushToast({
                    type: 'success',
                    title: 'Approve berhasil',
                    message: `✅ ${cur.name} berhasil diapprove dan ditambahkan ke ${group} sebagai ${role}`,
                    durationMs: 5000,
                  })
                  setActive(null)
                })
              }}
            >
              ✅ Konfirmasi Approve
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        open={rejectOpen && !!active}
        title="❌ Tolak Pendaftaran"
        onClose={() => {
          setRejectOpen(false)
          setActive(null)
        }}
        widthClassName="w-[520px]"
      >
        <div className="space-y-4">
          <div className="text-sm text-slate-200">Apakah Anda yakin menolak pendaftaran <span className="font-semibold text-white">{activeLabel}</span>?</div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">⚠️ Akun akan dihapus permanen dan tidak bisa dipulihkan.</div>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
              onClick={() => {
                setRejectOpen(false)
                setActive(null)
              }}
            >
              Batal
            </button>
            <button
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              onClick={() => {
                const cur = active
                if (!cur) return
                setRejectOpen(false)
                onRemove(cur.id, () => {
                  pushToast({ type: 'error', title: 'Ditolak', message: `❌ Pendaftaran ${cur.name} telah ditolak`, durationMs: 5000 })
                  setActive(null)
                })
              }}
            >
              ❌ Ya, Tolak
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}

