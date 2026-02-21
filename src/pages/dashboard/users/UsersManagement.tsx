import { useMemo, useState } from 'react'
import { Eye, Pencil, ShieldBan } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import Chip from '@/components/Chip'
import RightDrawer from '@/components/RightDrawer'
import OverlayModal from '@/components/OverlayModal'
import { useToastStore } from '@/stores/toastStore'
import { useUsers, type DbUser, type DbUserRole, type DbUserStatus } from '@/hooks/useSupabase'
import { supabase } from '@/utils/supabase'

type RoleFilter = DbUserRole | 'SEMUA'
type StatusFilter = DbUserStatus | 'SEMUA'

function roleColor(r: DbUserRole | null) {
  if (r === 'SUPER_ADMIN') return 'bg-red-500 text-white'
  if (r === 'ADMIN') return 'bg-orange-500 text-white'
  if (r === 'COORDINATOR') return 'bg-blue-500 text-white'
  return 'bg-white/10 text-slate-200'
}

function statusBadge(s: DbUserStatus | null) {
  if (s === 'ACTIVE') return { dot: 'bg-emerald-400 animate-pulse', txt: 'ACTIVE', cls: 'text-emerald-200' }
  if (s === 'PENDING') return { dot: 'bg-amber-400', txt: 'PENDING', cls: 'text-amber-200' }
  if (s === 'SUSPENDED') return { dot: 'bg-red-400', txt: 'SUSPENDED', cls: 'text-red-200' }
  if (s === 'REJECTED') return { dot: 'bg-red-400', txt: 'REJECTED', cls: 'text-red-200' }
  return { dot: 'bg-slate-500', txt: 'UNKNOWN', cls: 'text-slate-300' }
}

export default function UsersManagement() {
  const pushToast = useToastStore((s) => s.push)
  const { users, loading, error, refetch } = useUsers()

  const [q, setQ] = useState('')
  const [role, setRole] = useState<RoleFilter>('SEMUA')
  const [status, setStatus] = useState<StatusFilter>('SEMUA')

  const [drawer, setDrawer] = useState<DbUser | null>(null)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [roleDraft, setRoleDraft] = useState<DbUserRole>('MEMBER')

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return users
      .filter((u) => (role === 'SEMUA' ? true : u.role === role))
      .filter((u) => (status === 'SEMUA' ? true : u.status === status))
      .filter((u) => {
        if (!qq) return true
        const name = (u.name ?? '').toLowerCase()
        const email = (u.email ?? '').toLowerCase()
        return name.includes(qq) || email.includes(qq)
      })
  }, [q, role, status, users])

  const counts = useMemo(() => {
    const by: Record<string, number> = { SEMUA: users.length }
    ;(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'MEMBER'] as const).forEach((r) => {
      by[r] = users.filter((u) => u.role === r).length
    })
    return by as Record<'SEMUA' | DbUserRole, number>
  }, [users])

  const openDrawer = (u: DbUser) => {
    setDrawer(u)
    setRoleDraft((u.role ?? 'MEMBER') as DbUserRole)
  }

  const saveRole = async () => {
    const cur = drawer
    if (!cur) return
    const { error: e } = await supabase
      .from('users')
      .update({ role: roleDraft, updated_at: new Date().toISOString() })
      .eq('id', cur.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      return
    }
    pushToast({ type: 'success', title: 'Role diubah', message: `✅ Role ${cur.name ?? cur.email ?? cur.id} berhasil diubah`, durationMs: 5000 })
    setEditRoleOpen(false)
    await refetch()
  }

  const toggleSuspend = async () => {
    const cur = drawer
    if (!cur) return
    const nextStatus: DbUserStatus = cur.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    const payload =
      nextStatus === 'SUSPENDED'
        ? { status: nextStatus, suspended_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        : { status: nextStatus, suspended_at: null, updated_at: new Date().toISOString() }

    const { error: e } = await supabase.from('users').update(payload).eq('id', cur.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      return
    }
    pushToast({ type: 'success', title: 'Status diubah', message: `✅ Status ${cur.name ?? cur.email ?? cur.id} diperbarui`, durationMs: 5000 })
    setStatusOpen(false)
    await refetch()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">👥 Manajemen User</div>
          <div className="text-sm text-slate-300">Kelola role dan status akun dari Supabase.</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Total: {users.length}</div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Cari nama/email..."
          />
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleFilter)}
          >
            <option value="SEMUA">Role</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN ({counts.SUPER_ADMIN})</option>
            <option value="ADMIN">ADMIN ({counts.ADMIN})</option>
            <option value="COORDINATOR">COORDINATOR ({counts.COORDINATOR})</option>
            <option value="MEMBER">MEMBER ({counts.MEMBER})</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
          >
            <option value="SEMUA">Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        {error ? <div className="mt-3 text-sm text-red-200">{error}</div> : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
        <div className="grid grid-cols-[1.6fr_1.6fr_1fr_1fr_1fr_0.9fr] gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <div>Nama</div>
          <div>Email</div>
          <div>Role</div>
          <div>Grup</div>
          <div>Status</div>
          <div>Aksi</div>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((u) => {
              const st = statusBadge(u.status)
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-[1.6fr_1.6fr_1fr_1fr_1fr_0.9fr] items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-sm hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{u.name ?? '-'}</div>
                  </div>
                  <div className="truncate text-slate-200">{u.email ?? '-'}</div>
                  <div>
                    <Chip className={roleColor(u.role)}>{u.role ?? 'MEMBER'}</Chip>
                  </div>
                  <div className="truncate text-slate-200">{u.group_name ?? '-'}</div>
                  <div className={`flex items-center gap-2 ${st.cls}`}>
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    <span className="text-sm">{st.txt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                      title="Lihat Detail"
                      onClick={() => openDrawer(u)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                      title="Edit Role"
                      onClick={() => {
                        openDrawer(u)
                        setEditRoleOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                      title="Ubah Status"
                      onClick={() => {
                        openDrawer(u)
                        setStatusOpen(true)
                      }}
                    >
                      <ShieldBan className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <RightDrawer open={!!drawer} title="Detail User" onClose={() => setDrawer(null)}>
        {drawer ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Identitas ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>👤 {drawer.name ?? '-'}</div>
                <div>📧 {drawer.email ?? '-'}</div>
                <div>📱 {drawer.phone ?? '-'}</div>
                <div>🏷️ Role: {drawer.role ?? 'MEMBER'}</div>
                <div>🧩 Grup: {drawer.group_name ?? '-'}</div>
                <div>🧷 Status: {drawer.status ?? '-'}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => setEditRoleOpen(true)}
              >
                ✏️ Edit Role
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                onClick={() => setStatusOpen(true)}
              >
                🚫 Ubah Status
              </button>
            </div>
          </div>
        ) : null}
      </RightDrawer>

      <OverlayModal open={editRoleOpen && !!drawer} title={`✏️ Edit Role — ${drawer?.name ?? ''}`} onClose={() => setEditRoleOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">
            Role saat ini: <span className="font-semibold text-white">{drawer?.role ?? 'MEMBER'}</span>
          </div>
          <div className="text-sm text-slate-200">Role baru:</div>
          <select
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={roleDraft}
            onChange={(e) => setRoleDraft(e.target.value as DbUserRole)}
          >
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="COORDINATOR">COORDINATOR</option>
            <option value="MEMBER">MEMBER</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setEditRoleOpen(false)}>
              Batal
            </button>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" onClick={() => void saveRole()}>
              💾 Simpan
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal open={statusOpen && !!drawer} title="🚫 Ubah Status Akun" onClose={() => setStatusOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">
            User: <span className="font-semibold text-white">{drawer?.name ?? drawer?.email ?? '-'}</span>
          </div>
          <div className="text-sm text-slate-300">
            Status akan diubah menjadi <span className="font-semibold text-white">{drawer?.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'}</span>.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setStatusOpen(false)}>
              Batal
            </button>
            <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500" onClick={() => void toggleSuspend()}>
              Ya, Ubah
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}
