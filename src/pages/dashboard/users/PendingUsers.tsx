import { useMemo, useState } from 'react'
import OverlayModal from '@/components/OverlayModal'
import Skeleton from '@/components/Skeleton'
import { useToastStore } from '@/stores/toastStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useUsers, type DbUser, type DbUserRole } from '@/hooks/useSupabase'
import { supabase } from '@/utils/supabase'

const defaultGroups = ['Grup Cibinong', 'Grup Sentul', 'Grup Depok', 'Grup Bogor Kota'] as const

export default function PendingUsers() {
  const pushToast = useToastStore((s) => s.push)
  const currentUser = useSessionStore((s) => s.user)
  const { users: pendingUsers, loading, error, refetch } = useUsers({ status: 'PENDING' })

  const [selected, setSelected] = useState<DbUser | null>(null)
  const [approveOpen, setApproveOpen] = useState(false)
  const [groupName, setGroupName] = useState<(typeof defaultGroups)[number]>('Grup Cibinong')
  const [role, setRole] = useState<DbUserRole>('MEMBER')
  const [busy, setBusy] = useState(false)

  const count = pendingUsers.length

  const activeLabel = useMemo(() => {
    if (!selected) return ''
    return `${selected.name ?? '-'} (${selected.email ?? '-'})`
  }, [selected])

  const openApprove = (u: DbUser) => {
    setSelected(u)
    setGroupName((u.group_name as (typeof defaultGroups)[number] | null) ?? 'Grup Cibinong')
    setRole((u.role ?? 'MEMBER') as DbUserRole)
    setApproveOpen(true)
  }

  const handleApprove = async () => {
    if (!selected?.id) return
    if (!currentUser?.id) return
    setBusy(true)
    const { error: e } = await supabase
      .from('users')
      .update({
        status: 'ACTIVE',
        role,
        group_name: groupName,
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', selected.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal approve', message: e.message, durationMs: 6000 })
      setBusy(false)
      return
    }
    pushToast({ type: 'success', title: 'Berhasil', message: `✅ ${selected.name ?? selected.email ?? selected.id} di-approve`, durationMs: 5000 })
    setApproveOpen(false)
    setSelected(null)
    await refetch()
    setBusy(false)
  }

  const handleReject = async (u: DbUser) => {
    if (!u.id) return
    setBusy(true)
    const { error: e } = await supabase
      .from('users')
      .update({ status: 'REJECTED', rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', u.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal menolak', message: e.message, durationMs: 6000 })
      setBusy(false)
      return
    }
    pushToast({ type: 'success', title: 'Ditolak', message: `❌ Pendaftaran ${u.name ?? u.email ?? u.id} ditolak`, durationMs: 5000 })
    await refetch()
    setBusy(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-slate-100">👥 Pending Approval</div>
          <div className="text-sm text-slate-300">Kelola pendaftar baru dari tabel `users` (Supabase).</div>
        </div>
        <div className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-semibold text-amber-200">{count} Menunggu</div>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : count === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center">
          <div className="text-5xl">✅</div>
          <div className="mt-3 text-lg font-semibold text-white">Semua pendaftar sudah diproses</div>
          <div className="mt-1 text-sm text-slate-300">Tidak ada yang menunggu approval saat ini</div>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingUsers.map((u) => (
            <div key={u.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{u.name ?? '-'}</div>
                  <div className="mt-1 text-sm text-slate-200">📧 {u.email ?? '-'}</div>
                  <div className="mt-1 text-sm text-slate-200">📱 {u.phone ?? '-'}</div>
                  <div className="mt-1 text-xs text-slate-400">ID: {u.id}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                    onClick={() => openApprove(u)}
                    disabled={busy}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                    onClick={() => void handleReject(u)}
                    disabled={busy}
                  >
                    ❌ Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <OverlayModal open={approveOpen && !!selected} title={`✅ Approve — ${activeLabel}`} onClose={() => setApproveOpen(false)} widthClassName="w-[560px]">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-300">Grup</div>
            <select
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value as (typeof defaultGroups)[number])}
              disabled={busy}
            >
              {defaultGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-300">Role</div>
            <select
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
              value={role}
              onChange={(e) => setRole(e.target.value as DbUserRole)}
              disabled={busy}
            >
              <option value="MEMBER">MEMBER</option>
              <option value="COORDINATOR">COORDINATOR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setApproveOpen(false)} disabled={busy}>
              Batal
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
              onClick={() => void handleApprove()}
              disabled={busy}
            >
              💾 Simpan
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}
