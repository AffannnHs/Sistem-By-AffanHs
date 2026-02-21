import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertOctagon, BarChart3, CheckCircle2, Users } from 'lucide-react'
import Skeleton from '@/components/Skeleton'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM'

type Feed = {
  id: string
  typeLabel: string
  severity: Severity
  address: string
  reporter: string
  trigger: string
  timeLabel: string
  responders: string
  escalation?: string
}

const feed: Feed[] = [
  {
    id: 'ALT-1001',
    typeLabel: '🔥 KEBAKARAN',
    severity: 'CRITICAL',
    address: 'Jl. Raya Cibinong No. 12, Kab. Bogor',
    reporter: 'Budi Santoso',
    trigger: '📱 App Mobile',
    timeLabel: '8 mnt',
    responders: '3 notified, 2 ACK, 1 enroute',
    escalation: 'Eskalasi Level 2 → 3 dalam: 00:45',
  },
  {
    id: 'ALT-1002',
    typeLabel: '🏥 MEDIS',
    severity: 'HIGH',
    address: 'Jl. Sentul Raya, Kab. Bogor',
    reporter: 'Hana Pertiwi',
    trigger: '📱 App Mobile',
    timeLabel: '22 mnt lalu',
    responders: '2 notified, 1 ACK',
  },
  {
    id: 'ALT-1003',
    typeLabel: '🆘 BANTUAN',
    severity: 'MEDIUM',
    address: 'Jl. Margonda, Depok',
    reporter: 'Irfan Maulana',
    trigger: '📱 App Mobile',
    timeLabel: '35 mnt',
    responders: '1 notified',
  },
]

function sevBorder(s: Severity) {
  if (s === 'CRITICAL') return 'border-l-red-500'
  if (s === 'HIGH') return 'border-l-orange-500'
  return 'border-l-amber-500'
}

function sevChip(s: Severity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  return 'bg-amber-400 text-black'
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState('')

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} WIB`)
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [])

  const dateLabel = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' })
  }, [])

  const statCards = useMemo(
    () => [
      { label: 'Alert Aktif', value: '3', icon: AlertOctagon, color: 'text-red-300', sub: '2 CRITICAL • 1 HIGH' },
      { label: 'Total Hari Ini', value: '12', icon: BarChart3, color: 'text-blue-300', sub: '↑ 4 dari kemarin' },
      { label: 'Responder Online', value: '8', icon: Users, color: 'text-emerald-300', sub: 'dari 15 terdaftar' },
      { label: 'Diselesaikan', value: '9', icon: CheckCircle2, color: 'text-emerald-300', sub: 'hari ini' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-white">Selamat datang, Ahmad! 👋</div>
          <div className="mt-1 text-sm text-slate-300">{dateLabel}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm font-semibold text-white">🕐 {clock}</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">{c.label}</div>
                    <div className={`grid h-9 w-9 place-items-center rounded-xl bg-white/5 ${c.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3 text-3xl font-bold text-white">{c.value}</div>
                  <div className="mt-2 text-xs text-slate-400">{c.sub}</div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[60%_40%]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-white">🚨 Alert Aktif</div>
              <div className="rounded-full bg-red-500/25 px-2 py-0.5 text-xs font-semibold text-red-200">3</div>
            </div>
            <Link to="/dashboard/alerts" className="text-sm font-semibold text-blue-200 hover:text-blue-100">
              Lihat Semua →
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </>
            ) : (
              feed.map((a) => (
                <div key={a.id} className={`rounded-2xl border border-[var(--border)] bg-white/5 p-4 ${sevBorder(a.severity)} border-l-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">{a.typeLabel}</div>
                      <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevChip(a.severity)}`}>{a.severity}</div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> ● AKTIF
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{a.timeLabel}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">📍 {a.address}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div>👤 {a.reporter}</div>
                    <div>{a.trigger}</div>
                  </div>
                  <div className="mt-3 text-xs text-slate-300">Responder: {a.responders}</div>
                  {a.escalation ? <div className="mt-1 text-xs font-semibold text-red-200">⏱️ {a.escalation}</div> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/dashboard/alerts/${a.id}`} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
                      👁 Detail
                    </Link>
                    <Link to={`/dashboard/alerts/${a.id}?tab=chat`} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
                      💬 Chat
                    </Link>
                    <button className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">👤 Assign</button>
                    <button className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500">✅ Resolve</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">👥 Responder Online</div>
              <div className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">8</div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { n: 'Dewi Kusuma', r: 'COORDINATOR', s: '🔵 Menuju TKP', loc: 'Cibinong, Bogor' },
                { n: 'Eko Prasetyo', r: 'COORDINATOR', s: '🟢 Standby', loc: 'Depok' },
                { n: 'Gunawan Wijaya', r: 'MEMBER', s: '🟢 Standby', loc: 'Cibinong' },
                { n: 'Hana Pertiwi', r: 'MEMBER', s: '🟡 Dalam Tugas', loc: 'Sentul' },
              ].map((u) => (
                <div key={u.n} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                        u.r === 'COORDINATOR' ? 'bg-blue-500/20 text-blue-200' : 'bg-emerald-500/20 text-emerald-200'
                      }`}
                    >
                      {u.n
                        .split(' ')
                        .slice(0, 2)
                        .map((x) => x[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{u.n}</div>
                      <div className="text-xs text-slate-400">{u.r}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-200">{u.s}</div>
                    <div className="text-xs text-slate-400">{u.loc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-sm font-semibold text-white">📊 Statistik Alert Hari Ini</div>
          <div className="mt-4 grid grid-cols-6 items-end gap-2">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded" />)
              : ([1, 0, 2, 3, 4, 2] as const).map((v, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-28 w-full rounded-lg bg-white/10">
                      <div className="w-full rounded-lg bg-red-500" style={{ height: `${(v / 4) * 100}%` }} />
                    </div>
                    <div className="text-[11px] text-slate-400">{['06', '08', '10', '12', '14', '16'][i]}.00</div>
                  </div>
                ))}
          </div>

          <div className="mt-6 space-y-3">
            {[{ l: '🔥 Kebakaran', v: 4, c: 'bg-red-500' }, { l: '🏥 Medis', v: 3, c: 'bg-emerald-500' }, { l: '🦹 Kriminal', v: 2, c: 'bg-purple-500' }, { l: '🌊 Bencana', v: 1, c: 'bg-blue-500' }, { l: '🆘 Bantuan', v: 2, c: 'bg-amber-400' }].map((r) => (
              <div key={r.l}>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div>{r.l}</div>
                  <div>{r.v}</div>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className={`h-2 rounded-full ${r.c}`} style={{ width: `${(r.v / 4) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

