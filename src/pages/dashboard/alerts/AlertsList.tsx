import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Filter, Search } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import Chip from '@/components/Chip'
import { useToastStore } from '@/stores/toastStore'
import { alerts as seed } from '@/mock/data'
import type { Alert, AlertStatus, Severity } from '@/mock/types'

type TypeFilter = 'SEMUA' | 'FIRE' | 'MEDICAL' | 'CRIME' | 'DISASTER' | 'HELP'
type Tab = 'AKTIF' | 'ESKALASI' | 'SELESAI' | 'SEMUA'

function severityBorder(s: Severity) {
  if (s === 'CRITICAL') return 'border-l-red-500 bg-red-500/5'
  if (s === 'HIGH') return 'border-l-orange-500'
  if (s === 'MEDIUM') return 'border-l-amber-500'
  return 'border-l-slate-500'
}

function typePill(a: Alert) {
  if (a.type === 'FIRE') return 'bg-red-500 text-white'
  if (a.type === 'MEDICAL') return 'bg-emerald-500 text-white'
  if (a.type === 'CRIME') return 'bg-purple-500 text-white'
  if (a.type === 'DISASTER') return 'bg-blue-500 text-white'
  return 'bg-amber-400 text-black'
}

function severityPill(s: Severity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  if (s === 'MEDIUM') return 'bg-amber-400 text-black'
  return 'bg-slate-500 text-white'
}

function statusBadge(st: AlertStatus) {
  if (st === 'AKTIF') return { cls: 'text-red-200', label: '● AKTIF' }
  if (st === 'ESKALASI') return { cls: 'bg-orange-500 text-white animate-pulse', label: '⚡ ESKALASI' }
  return { cls: 'bg-emerald-600 text-white', label: '✅ SELESAI' }
}

export default function AlertsList() {
  const pushToast = useToastStore((s) => s.push)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    seed.forEach((a) => {
      if (a.status === 'ESKALASI' && a.escalationCountdownSec) init[a.id] = a.escalationCountdownSec
    })
    return init
  })
  const [q, setQ] = useState('')
  const [type, setType] = useState<TypeFilter>('SEMUA')
  const [severity, setSeverity] = useState<Severity | 'SEMUA'>('SEMUA')
  const [tab, setTab] = useState<Tab>('AKTIF')
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = window.setInterval(() => {
      setCountdown((c) => {
        const next: Record<string, number> = { ...c }
        Object.keys(next).forEach((k) => {
          next[k] = next[k] <= 0 ? 0 : next[k] - 1
        })
        return next
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  const counts = useMemo(() => {
    const active = seed.filter((a) => a.status === 'AKTIF').length
    const escalation = seed.filter((a) => a.status === 'ESKALASI').length
    const done = seed.filter((a) => a.status === 'SELESAI').length
    return { active, escalation, done, all: seed.length }
  }, [])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return seed
      .filter((a) => {
        if (tab === 'SEMUA') return true
        if (tab === 'AKTIF') return a.status === 'AKTIF'
        if (tab === 'ESKALASI') return a.status === 'ESKALASI'
        return a.status === 'SELESAI'
      })
      .filter((a) => (type === 'SEMUA' ? true : a.type === type))
      .filter((a) => (severity === 'SEMUA' ? true : a.severity === severity))
      .filter((a) => {
        if (!qq) return true
        return (
          a.reporter.toLowerCase().includes(qq) ||
          a.location.toLowerCase().includes(qq) ||
          a.address.toLowerCase().includes(qq)
        )
      })
  }, [q, severity, tab, type])

  const onReset = () => {
    setQ('')
    setType('SEMUA')
    setSeverity('SEMUA')
    setTab('AKTIF')
  }

  const onExport = (kind: 'CSV' | 'PDF') => {
    setExportOpen(false)
    pushToast({ type: 'success', title: 'Export berhasil', message: `✅ Data alert berhasil diexport (${kind})`, durationMs: 5000 })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-slate-100">🚨 Manajemen Alert</div>
          <div className="text-sm text-slate-300">Filter dan kelola semua alert.</div>
        </div>
        <div className="relative flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm text-white hover:bg-white/15">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm text-white hover:bg-white/15"
            onClick={() => setExportOpen((v) => !v)}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {exportOpen ? (
            <div className="absolute right-0 top-11 w-44 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
              <button
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                onClick={() => onExport('CSV')}
              >
                Export CSV
              </button>
              <button
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                onClick={() => onExport('PDF')}
              >
                Export PDF
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              data-search
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama pelapor / lokasi..."
            />
          </div>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={type}
            onChange={(e) => setType(e.target.value as TypeFilter)}
          >
            <option value="SEMUA">Semua Jenis</option>
            <option value="FIRE">🔥 Kebakaran</option>
            <option value="MEDICAL">🏥 Medis</option>
            <option value="CRIME">🦹 Kriminal</option>
            <option value="DISASTER">🌊 Bencana</option>
            <option value="HELP">🆘 Bantuan</option>
          </select>
          <select
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity | 'SEMUA')}
          >
            <option value="SEMUA">Semua Severity</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          <button className="h-10 rounded-xl bg-white/10 px-4 text-sm font-semibold text-white hover:bg-white/15" onClick={onReset}>
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              tab === 'AKTIF' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            onClick={() => setTab('AKTIF')}
          >
            Aktif ({counts.active})
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              tab === 'ESKALASI' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            onClick={() => setTab('ESKALASI')}
          >
            Eskalasi ({counts.escalation})
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              tab === 'SELESAI' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            onClick={() => setTab('SELESAI')}
          >
            Selesai ({counts.done})
          </button>
          <button
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              tab === 'SEMUA' ? 'bg-white/10 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
            onClick={() => setTab('SEMUA')}
          >
            Semua ({counts.all})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-10 text-center">
          <div className="text-5xl">🎉</div>
          <div className="mt-3 text-lg font-semibold text-white">Tidak ada alert saat ini</div>
          <div className="mt-1 text-sm text-slate-300">Semua aman!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const sb = statusBadge(a.status)
            const done = a.status === 'SELESAI'
            return (
              <div
                key={a.id}
                className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 ${done ? 'opacity-80' : ''}`}
              >
                <div className={`border-l-4 pl-4 ${severityBorder(a.severity)}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Chip className={typePill(a)}>{a.typeLabel}</Chip>
                      <Chip className={severityPill(a.severity)}>{a.severity}</Chip>
                      {a.status === 'AKTIF' ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
                          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />
                          {sb.label}
                        </div>
                      ) : (
                        <Chip className={sb.cls}>{sb.label}</Chip>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{a.timeLabel}</div>
                  </div>

                  <div className="mt-3 text-sm text-slate-200">📍 {a.address}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                    <div>👤 Pelapor: {a.reporter}</div>
                    <div>📡 Trigger: {a.trigger}</div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">── Eskalasi ──</div>
                      <div className="mt-2 text-xs text-slate-300">Level {a.escalationLevel}/3</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(a.escalationLevel / 3) * 100}%`,
                            background:
                              a.severity === 'CRITICAL'
                                ? '#ef4444'
                                : a.severity === 'HIGH'
                                  ? '#f97316'
                                  : a.severity === 'MEDIUM'
                                    ? '#eab308'
                                    : '#64748b',
                          }}
                        />
                      </div>
                      {a.status === 'ESKALASI' && typeof countdown[a.id] === 'number' ? (
                        <div className="mt-2 text-xs font-semibold text-red-200">
                          Naik ke Level 3 dalam 00:{String(countdown[a.id]).padStart(2, '0')}
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">── Responder ──</div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-300">
                        <div>📬 {a.responder.notified} notified</div>
                        <div>✅ {a.responder.ack} ACK</div>
                        <div>🔵 {a.responder.enRoute} en route</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/dashboard/alerts/${a.id}`}
                    className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  >
                    👁 Detail
                  </Link>
                  {!done ? (
                    <>
                      <Link
                        to={`/dashboard/alerts/${a.id}?tab=chat`}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
                      >
                        💬 Chat
                      </Link>
                      <button className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
                        👤 Assign
                      </button>
                      <button
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                        onClick={() =>
                          pushToast({
                            type: 'success',
                            title: 'Resolve',
                            message: `✅ Alert ${a.id} ditandai selesai (simulasi).`,
                            durationMs: 5000,
                          })
                        }
                      >
                        ✅ Resolve
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

