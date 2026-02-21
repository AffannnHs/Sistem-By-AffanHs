import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertOctagon, BarChart3, CheckCircle2, Users } from 'lucide-react'
import Skeleton from '@/components/Skeleton'
import { useSessionStore } from '@/stores/sessionStore'
import { supabase } from '@/utils/supabase'
import { useAlerts, useUsers, type DbAlert, type DbAlertSeverity } from '@/hooks/useSupabase'

function typeLabel(t: string) {
  if (t === 'FIRE') return '🔥 KEBAKARAN'
  if (t === 'MEDICAL') return '🏥 MEDIS'
  if (t === 'CRIME') return '🦹 KRIMINAL'
  if (t === 'DISASTER') return '🌊 BENCANA'
  return '🆘 BANTUAN'
}

function sevBorder(s: DbAlertSeverity) {
  if (s === 'CRITICAL') return 'border-l-red-500'
  if (s === 'HIGH') return 'border-l-orange-500'
  if (s === 'MEDIUM') return 'border-l-amber-500'
  return 'border-l-slate-500'
}

function sevChip(s: DbAlertSeverity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  if (s === 'MEDIUM') return 'bg-amber-400 text-black'
  return 'bg-slate-500 text-white'
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

function isOnline(lastSeenAt: string | null) {
  if (!lastSeenAt) return false
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  return diff < 10 * 60 * 1000
}

export default function DashboardHome() {
  const me = useSessionStore((s) => s.user)

  const { alerts, loading: alertsLoading } = useAlerts({ status: 'ACTIVE', limit: 6 })
  const { users, loading: usersLoading } = useUsers({ status: 'ACTIVE' })

  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({ activeAlerts: 0, totalToday: 0, resolvedToday: 0 })
  const [todayByType, setTodayByType] = useState<Record<string, number>>({})
  const [clock, setClock] = useState('')

  useEffect(() => {
    const run = async () => {
      setStatsLoading(true)
      const today = new Date().toISOString().slice(0, 10)
      const [activeRes, todayRes, resolvedTodayRes, todayTypesRes] = await Promise.all([
        supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
        supabase.from('alerts').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase
          .from('alerts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'RESOLVED')
          .gte('resolved_at', today),
        supabase.from('alerts').select('type').gte('created_at', today),
      ])
      setStats({
        activeAlerts: activeRes.count ?? 0,
        totalToday: todayRes.count ?? 0,
        resolvedToday: resolvedTodayRes.count ?? 0,
      })
      const by: Record<string, number> = {}
      ;((todayTypesRes.data ?? []) as { type: string }[]).forEach((r) => {
        by[r.type] = (by[r.type] ?? 0) + 1
      })
      setTodayByType(by)
      setStatsLoading(false)
    }

    void run()
    const t = window.setInterval(() => void run(), 30000)
    return () => window.clearInterval(t)
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

  const onlineResponders = useMemo(() => users.filter((u) => isOnline(u.last_seen_at)).slice(0, 8), [users])

  const critCount = useMemo(() => alerts.filter((a) => a.severity === 'CRITICAL').length, [alerts])
  const highCount = useMemo(() => alerts.filter((a) => a.severity === 'HIGH').length, [alerts])

  const statCards = useMemo(() => {
    return [
      {
        label: 'Alert Aktif',
        value: String(stats.activeAlerts),
        icon: AlertOctagon,
        color: 'text-red-300',
        sub: `${critCount} CRITICAL • ${highCount} HIGH`,
      },
      { label: 'Total Hari Ini', value: String(stats.totalToday), icon: BarChart3, color: 'text-blue-300', sub: 'Update real-time' },
      {
        label: 'Responder Online',
        value: String(onlineResponders.length),
        icon: Users,
        color: 'text-emerald-300',
        sub: `dari ${users.length} user ACTIVE`,
      },
      { label: 'Diselesaikan', value: String(stats.resolvedToday), icon: CheckCircle2, color: 'text-emerald-300', sub: 'hari ini' },
    ]
  }, [critCount, highCount, onlineResponders.length, stats.activeAlerts, stats.resolvedToday, stats.totalToday, users.length])

  const loading = statsLoading || alertsLoading || usersLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-white">Selamat datang, {me?.name ?? me?.email ?? 'User'}!</div>
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
            <div className="rounded-full bg-red-500/25 px-2 py-0.5 text-xs font-semibold text-red-200">{stats.activeAlerts}</div>
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
              (alerts as DbAlert[]).map((a) => (
                <div key={a.id} className={`rounded-2xl border border-[var(--border)] bg-white/5 p-4 ${sevBorder(a.severity)} border-l-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">{typeLabel(a.type)}</div>
                      <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sevChip(a.severity)}`}>{a.severity}</div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> ● AKTIF
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">{fromNowLabel(a.created_at)}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">📍 {a.address ?? '-'}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div>👤 {a.reporter_name ?? '-'}</div>
                    <div>{a.trigger_source ?? '-'}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={`/dashboard/alerts/${a.id}`} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
                      👁 Detail
                    </Link>
                    <Link to={`/dashboard/alerts/${a.id}?tab=chat`} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15">
                      💬 Chat
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">👥 Responder Online</div>
              <div className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">{onlineResponders.length}</div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                ...onlineResponders.map((u) => ({
                  n: u.name ?? u.email ?? '-',
                  r: u.role ?? 'MEMBER',
                  loc: u.group_name ?? '-',
                  seen: u.last_seen_at,
                })),
              ].map((u) => (
                <div key={u.n} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                        u.r === 'COORDINATOR' ? 'bg-blue-500/20 text-blue-200' : u.r === 'SUPER_ADMIN' ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/20 text-emerald-200'
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
                    <div className="text-sm text-slate-200">🟢 Online</div>
                    <div className="text-xs text-slate-400">{u.loc} • {u.seen ? fromNowLabel(u.seen) : '-'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="text-sm font-semibold text-white">📊 Breakdown Alert Hari Ini</div>
          {loading ? (
            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {(['FIRE', 'MEDICAL', 'CRIME', 'DISASTER', 'HELP'] as const).map((t) => {
                const v = todayByType[t] ?? 0
                const denom = Math.max(1, stats.totalToday)
                const pct = Math.round((v / denom) * 100)
                const color = t === 'FIRE' ? 'bg-red-500' : t === 'MEDICAL' ? 'bg-emerald-500' : t === 'CRIME' ? 'bg-purple-500' : t === 'DISASTER' ? 'bg-blue-500' : 'bg-amber-400'
                return (
                  <div key={t}>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div>{typeLabel(t)}</div>
                      <div>{v}</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

