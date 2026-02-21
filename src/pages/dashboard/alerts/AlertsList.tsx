import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Download, Filter, Search } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import Chip from '@/components/Chip'
import OverlayModal from '@/components/OverlayModal'
import { useToastStore } from '@/stores/toastStore'
import { useAlerts, type DbAlert, type DbAlertSeverity, type DbAlertStatus, type DbAlertType } from '@/hooks/useSupabase'
import { supabase } from '@/utils/supabase'

type TypeFilter = DbAlertType | 'SEMUA'
type Tab = DbAlertStatus | 'SEMUA'

function typePill(t: DbAlertType) {
  if (t === 'FIRE') return 'bg-red-500 text-white'
  if (t === 'MEDICAL') return 'bg-emerald-500 text-white'
  if (t === 'CRIME') return 'bg-purple-500 text-white'
  if (t === 'DISASTER') return 'bg-blue-500 text-white'
  return 'bg-amber-400 text-black'
}

function typeLabel(t: DbAlertType) {
  if (t === 'FIRE') return '🔥 KEBAKARAN'
  if (t === 'MEDICAL') return '🏥 MEDIS'
  if (t === 'CRIME') return '🦹 KRIMINAL'
  if (t === 'DISASTER') return '🌊 BENCANA'
  return '🆘 BANTUAN'
}

function severityPill(s: DbAlertSeverity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  if (s === 'MEDIUM') return 'bg-amber-400 text-black'
  return 'bg-slate-500 text-white'
}

function statusBadge(st: DbAlertStatus) {
  if (st === 'ACTIVE') return { cls: 'text-red-200', label: '● AKTIF' }
  return { cls: 'bg-emerald-600 text-white', label: '✅ SELESAI' }
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

function toCsv(rows: DbAlert[]) {
  const header = ['id', 'type', 'severity', 'status', 'location', 'address', 'reporter_name', 'trigger_source', 'created_at', 'resolved_at', 'lat', 'lng']
  const lines = [header.join(',')]
  rows.forEach((r) => {
    const vals = [
      r.id,
      r.type,
      r.severity,
      r.status,
      r.location ?? '',
      r.address ?? '',
      r.reporter_name ?? '',
      r.trigger_source ?? '',
      r.created_at,
      r.resolved_at ?? '',
      String(r.lat),
      String(r.lng),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`)
    lines.push(vals.join(','))
  })
  return lines.join('\n')
}

export default function AlertsList() {
  const pushToast = useToastStore((s) => s.push)
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('ACTIVE')
  const [q, setQ] = useState('')
  const [type, setType] = useState<TypeFilter>('SEMUA')
  const [severity, setSeverity] = useState<DbAlertSeverity | 'SEMUA'>('SEMUA')
  const [exportOpen, setExportOpen] = useState(false)
  const [resolveTarget, setResolveTarget] = useState<DbAlert | null>(null)
  const [busy, setBusy] = useState(false)

  const { alerts, loading, error, refetch } = useAlerts({ status: tab === 'SEMUA' ? undefined : tab })

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return alerts
      .filter((a) => (type === 'SEMUA' ? true : a.type === type))
      .filter((a) => (severity === 'SEMUA' ? true : a.severity === severity))
      .filter((a) => {
        if (!qq) return true
        return (
          (a.reporter_name ?? '').toLowerCase().includes(qq) ||
          (a.location ?? '').toLowerCase().includes(qq) ||
          (a.address ?? '').toLowerCase().includes(qq) ||
          a.id.toLowerCase().includes(qq)
        )
      })
  }, [alerts, q, severity, type])

  const counts = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'ACTIVE').length
    const done = alerts.filter((a) => a.status === 'RESOLVED').length
    return { active, done, all: alerts.length }
  }, [alerts])

  const onExport = (kind: 'CSV') => {
    setExportOpen(false)
    const csv = toCsv(filtered)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    pushToast({ type: 'success', title: 'Export berhasil', message: `✅ Data alert diexport (${kind})`, durationMs: 5000 })
  }

  const resolve = async () => {
    const a = resolveTarget
    if (!a) return
    setBusy(true)
    const { error: e } = await supabase
      .from('alerts')
      .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
      .eq('id', a.id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      setBusy(false)
      return
    }
    pushToast({ type: 'success', title: 'Selesai', message: '✅ Alert berhasil diselesaikan', durationMs: 5000 })
    setResolveTarget(null)
    setBusy(false)
    await refetch()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">🚨 Manajemen Alert</div>
          <div className="text-sm text-slate-300">Data real dari tabel `alerts` (Supabase).</div>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setExportOpen(true)}>
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          { k: 'ACTIVE' as const, l: `AKTIF (${counts.active})` },
          { k: 'RESOLVED' as const, l: `SELESAI (${counts.done})` },
          { k: 'SEMUA' as const, l: `SEMUA (${counts.all})` },
        ] as const).map((t) => (
          <button
            key={t.k}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === t.k ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            onClick={() => setTab(t.k)}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari id / pelapor / lokasi..."
            />
          </div>

          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={type} onChange={(e) => setType(e.target.value as TypeFilter)}>
            <option value="SEMUA">Tipe</option>
            <option value="FIRE">FIRE</option>
            <option value="MEDICAL">MEDICAL</option>
            <option value="CRIME">CRIME</option>
            <option value="DISASTER">DISASTER</option>
            <option value="HELP">HELP</option>
          </select>

          <select className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white" value={severity} onChange={(e) => setSeverity(e.target.value as DbAlertSeverity | 'SEMUA')}>
            <option value="SEMUA">Severity</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
            onClick={() => {
              setQ('')
              setType('SEMUA')
              setSeverity('SEMUA')
            }}
          >
            <Filter className="h-4 w-4" /> Reset
          </button>
        </div>
        {error ? <div className="mt-3 text-sm text-red-200">{error}</div> : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]">
        <div className="grid grid-cols-[1.2fr_1.2fr_1fr_1.2fr_0.9fr_0.8fr] gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <div>Alert</div>
          <div>Lokasi</div>
          <div>Pelapor</div>
          <div>Waktu</div>
          <div>Status</div>
          <div>Aksi</div>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-300">Tidak ada data.</div>
        ) : (
          <div>
            {filtered.map((a) => {
              const st = statusBadge(a.status)
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[1.2fr_1.2fr_1fr_1.2fr_0.9fr_0.8fr] items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-sm hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typePill(a.type)}`}>{typeLabel(a.type)}</div>
                      <Chip className={severityPill(a.severity)}>{a.severity}</Chip>
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-400">{a.id}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-slate-200">{a.location ?? '-'}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">📍 {a.address ?? '-'}</div>
                  </div>
                  <div className="truncate text-slate-200">{a.reporter_name ?? '-'}</div>
                  <div className="text-slate-200">{fromNowLabel(a.created_at)}</div>
                  <div className={`${st.cls} text-sm font-semibold`}>{st.label}</div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                      onClick={() => navigate(`/dashboard/alerts/${a.id}`)}
                    >
                      Detail
                    </button>
                    {a.status === 'ACTIVE' ? (
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                        onClick={() => setResolveTarget(a)}
                      >
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <OverlayModal open={exportOpen} title="📤 Export" onClose={() => setExportOpen(false)} widthClassName="w-[520px]">
        <div className="space-y-3">
          <div className="text-sm text-slate-200">Export akan menggunakan data hasil filter saat ini.</div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setExportOpen(false)}>
              Batal
            </button>
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500" onClick={() => onExport('CSV')}>
              Export CSV
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal open={!!resolveTarget} title="✅ Selesaikan Alert" onClose={() => setResolveTarget(null)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">Yakin ingin menyelesaikan alert ini?</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
            <div className="font-semibold text-white">{resolveTarget ? typeLabel(resolveTarget.type) : ''}</div>
            <div className="mt-1 text-xs text-slate-300">{resolveTarget?.location ?? '-'}</div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setResolveTarget(null)} disabled={busy}>
              Batal
            </button>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60" onClick={() => void resolve()} disabled={busy}>
              Ya, Resolve
            </button>
          </div>
        </div>
      </OverlayModal>

      <div className="text-xs text-slate-400">
        Tips: klik "Detail" untuk melihat chat dan kronologi di halaman detail.
      </div>

      <div className="hidden">
        <Link to="/dashboard/alerts/" />
      </div>
    </div>
  )
}
