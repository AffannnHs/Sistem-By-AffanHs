import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Pencil, ShieldBan, UserPlus } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import Chip from '@/components/Chip'
import RightDrawer from '@/components/RightDrawer'
import OverlayModal from '@/components/OverlayModal'
import { useToastStore } from '@/stores/toastStore'
import { users as seed } from '@/mock/data'
import type { UserRole, UserRow } from '@/mock/types'

type Tab = 'SEMUA' | 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER'

function roleColor(r: UserRole) {
  if (r === 'SUPER_ADMIN') return 'bg-red-500 text-white'
  if (r === 'ADMIN') return 'bg-orange-500 text-white'
  if (r === 'COORDINATOR') return 'bg-blue-500 text-white'
  return 'bg-white/10 text-slate-200'
}

function avatarBg(r: UserRole) {
  if (r === 'SUPER_ADMIN') return 'bg-red-500/20 text-red-200'
  if (r === 'ADMIN') return 'bg-orange-500/20 text-orange-200'
  if (r === 'COORDINATOR') return 'bg-blue-500/20 text-blue-200'
  return 'bg-emerald-500/20 text-emerald-200'
}

function statusBadge(s: UserRow['status']) {
  if (s === 'ONLINE') return { dot: 'bg-emerald-400 animate-pulse', txt: 'Online', cls: 'text-emerald-200' }
  if (s === 'DALAM_TUGAS') return { dot: 'bg-amber-400', txt: 'Dalam Tugas', cls: 'text-amber-200' }
  if (s === 'SUSPENDED') return { dot: 'bg-red-400', txt: 'Ditangguhkan', cls: 'text-red-200' }
  return { dot: 'bg-slate-500', txt: 'Offline', cls: 'text-slate-300' }
}

export default function UsersManagement() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<UserRow[]>(seed)

  const [q, setQ] = useState('')
  const [tab, setTab] = useState<Tab>('SEMUA')
  const [role, setRole] = useState<UserRole | 'SEMUA'>('SEMUA')
  const [group, setGroup] = useState<string>('SEMUA')
  const [status, setStatus] = useState<UserRow['status'] | 'SEMUA'>('SEMUA')

  const [drawer, setDrawer] = useState<UserRow | null>(null)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [roleDraft, setRoleDraft] = useState<UserRole>('MEMBER')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  const counts = useMemo(() => {
    const by: Record<string, number> = { SEMUA: rows.length }
    ;(['SUPER_ADMIN', 'ADMIN', 'COORDINATOR', 'MEMBER'] as const).forEach((r) => {
      by[r] = rows.filter((u) => u.role === r).length
    })
    return by as Record<Tab, number>
  }, [rows])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return rows
      .filter((u) => (tab === 'SEMUA' ? true : u.role === tab))
      .filter((u) => (role === 'SEMUA' ? true : u.role === role))
      .filter((u) => (group === 'SEMUA' ? true : u.group === group))
      .filter((u) => (status === 'SEMUA' ? true : u.status === status))
      .filter((u) => {
        if (!qq) return true
        return u.name.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq)
      })
  }, [group, q, role, rows, status, tab])

  const groups = useMemo(() => ['SEMUA', ...Array.from(new Set(rows.map((r) => r.group)))], [rows])

  const openDrawer = (u: UserRow) => {
    setDrawer(u)
    setRoleDraft(u.role)
  }

  const onSuspend = (id: string) => {
    setRows((x) => x.map((u) => (u.id === id ? { ...u, status: u.status === 'SUSPENDED' ? 'ONLINE' : 'SUSPENDED' } : u)))
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">👥 Manajemen User</div>
          <div className="text-sm text-slate-300">Kelola role, status, dan detail anggota.</div>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
          onClick={() => pushToast({ type: 'info', title: 'Undang User', message: 'Fitur undang user (simulasi).', durationMs: 5000 })}
        >
          <UserPlus className="h-4 w-4" />
          + Undang User Baru
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            data-search
            className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 Cari nama/email..."
          />
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole | 'SEMUA')}
          >
            <option value="SEMUA">Role</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="COORDINATOR">COORDINATOR</option>
            <option value="MEMBER">MEMBER</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g} value={g}>
                {g === 'SEMUA' ? 'Grup' : g}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserRow['status'] | 'SEMUA')}
          >
            <option value="SEMUA">Status</option>
            <option value="ONLINE">Online</option>
            <option value="DALAM_TUGAS">Dalam Tugas</option>
            <option value="OFFLINE">Offline</option>
            <option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(['SEMUA', 'ADMIN', 'COORDINATOR', 'MEMBER'] as const).map((t) => (
            <button
              key={t}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                tab === t ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              onClick={() => setTab(t)}
            >
              {t === 'SEMUA' ? `Semua (${counts.SEMUA})` : `${t} (${counts[t]})`}
            </button>
          ))}

          <Link
            to="/dashboard/users/pending"
            className="ml-auto rounded-xl bg-amber-500/20 px-3 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/25"
          >
            ⚠️ Pending (2)
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
        <div className="grid grid-cols-[1.6fr_1.6fr_1fr_1fr_1.1fr_1fr_0.9fr] gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <div>Avatar+Nama</div>
          <div>Email</div>
          <div>Role</div>
          <div>Grup</div>
          <div>Status</div>
          <div>Last Seen</div>
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
                  className={`grid grid-cols-[1.6fr_1.6fr_1fr_1fr_1.1fr_1fr_0.9fr] items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-sm hover:bg-white/5 ${
                    u.status === 'SUSPENDED' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${avatarBg(u.role)}`}>
                      {u.name
                        .split(' ')
                        .slice(0, 2)
                        .map((x) => x[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">{u.name}</div>
                    </div>
                  </div>
                  <div className="truncate text-slate-200">{u.email}</div>
                  <div>
                    <Chip className={roleColor(u.role)}>{u.role}</Chip>
                  </div>
                  <div className="text-slate-200">{u.group}</div>
                  <div className={`flex items-center gap-2 ${st.cls}`}>
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    <span className="text-sm">{st.txt}</span>
                  </div>
                  <div className="text-slate-300">{u.lastSeen}</div>
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
                        setDrawer(u)
                        setRoleDraft(u.role)
                        setEditRoleOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
                      title="Suspend"
                      onClick={() => {
                        setDrawer(u)
                        setSuspendOpen(true)
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
            <div className="flex items-center gap-3">
              <div className={`grid h-12 w-12 place-items-center rounded-full text-sm font-bold ${avatarBg(drawer.role)}`}>
                {drawer.name
                  .split(' ')
                  .slice(0, 2)
                  .map((x) => x[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{drawer.name}</div>
                <div className="mt-1 text-xs text-slate-400">{drawer.role} — {drawer.group}</div>
                <div className="mt-1 text-xs text-slate-300">Last seen: {drawer.lastSeen}</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Info Kontak ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>📧 {drawer.email}</div>
                <div>📱 {drawer.phone ?? '-'}</div>
                <div>📍 Terakhir: {drawer.lastLocation ?? '-'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Statistik ──</div>
              <div className="mt-2 space-y-1 text-sm text-slate-200">
                <div>Alert direspons: 47</div>
                <div>Bergabung: 15 Jan 2025</div>
                <div>Login terakhir: 20 Feb 2026</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs font-semibold text-slate-200">── Alert Aktif Saat Ini ──</div>
              <div className="mt-3 rounded-xl border border-white/10 bg-[var(--panel)] p-3">
                <div className="text-sm font-semibold text-white">🔥 Kebakaran — Cibinong</div>
                <div className="mt-1 text-xs text-slate-300">CRITICAL │ Sedang menuju TKP</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setRoleDraft(drawer.role)
                  setEditRoleOpen(true)
                }}
              >
                ✏️ Edit Role
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                onClick={() => setSuspendOpen(true)}
              >
                🚫 Suspend
              </button>
            </div>
          </div>
        ) : null}
      </RightDrawer>

      <OverlayModal open={editRoleOpen && !!drawer} title={`✏️ Edit Role — ${drawer?.name ?? ''}`} onClose={() => setEditRoleOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">Role saat ini: <span className="font-semibold text-white">{drawer?.role}</span></div>
          <div className="text-sm text-slate-200">Role baru:</div>
          <select
            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={roleDraft}
            onChange={(e) => setRoleDraft(e.target.value as UserRole)}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="COORDINATOR">COORDINATOR</option>
            <option value="MEMBER">MEMBER</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setEditRoleOpen(false)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                const cur = drawer
                if (!cur) return
                setRows((x) => x.map((u) => (u.id === cur.id ? { ...u, role: roleDraft } : u)))
                setEditRoleOpen(false)
                pushToast({ type: 'success', title: 'Role diubah', message: `✅ Role ${cur.name} berhasil diubah`, durationMs: 5000 })
              }}
            >
              💾 Simpan Perubahan
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal open={suspendOpen && !!drawer} title="🚫 Tangguhkan Akun" onClose={() => setSuspendOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">Apakah yakin menangguhkan akun <span className="font-semibold text-white">{drawer?.name}</span>?</div>
          <div className="text-sm text-slate-300">User tidak dapat login sampai akun diaktifkan kembali.</div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setSuspendOpen(false)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              onClick={() => {
                const cur = drawer
                if (!cur) return
                onSuspend(cur.id)
                setSuspendOpen(false)
                pushToast({ type: 'error', title: 'Status diubah', message: `🚫 Status ${cur.name} diperbarui`, durationMs: 5000 })
              }}
            >
              🚫 Ya, Tangguhkan
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}

