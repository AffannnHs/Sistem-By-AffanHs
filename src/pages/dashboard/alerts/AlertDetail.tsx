import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Paperclip, Send } from 'lucide-react'
import OverlayModal from '@/components/OverlayModal'
import Chip from '@/components/Chip'
import Skeleton from '@/components/Skeleton'
import { useToastStore } from '@/stores/toastStore'
import { useSessionStore } from '@/stores/sessionStore'
import { supabase } from '@/utils/supabase'
import { useAlertById, useChat, type DbAlertSeverity, type DbAlertType } from '@/hooks/useSupabase'

type MsgView = {
  id: string
  kind: 'system' | 'me' | 'other'
  at: string
  name?: string
  role?: string
  text: string
}

function severityChip(s: DbAlertSeverity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  if (s === 'MEDIUM') return 'bg-amber-400 text-black'
  return 'bg-slate-500 text-white'
}

function typeLabel(t: DbAlertType) {
  if (t === 'FIRE') return '🔥 KEBAKARAN'
  if (t === 'MEDICAL') return '🏥 MEDIS'
  if (t === 'CRIME') return '🦹 KRIMINAL'
  if (t === 'DISASTER') return '🌊 BENCANA'
  return '🆘 BANTUAN'
}

function timeHHMM(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function AlertDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const openChat = searchParams.get('tab') === 'chat'
  const navigate = useNavigate()

  const pushToast = useToastStore((s) => s.push)
  const user = useSessionStore((s) => s.user)

  const { alert, loading, error, refetch } = useAlertById(id)
  const { messages, loading: chatLoading, error: chatError, sendMessage } = useChat(id)

  const [resolveOpen, setResolveOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const senderIds = useMemo(() => {
    const set = new Set<string>()
    messages.forEach((m) => set.add(m.sender_id))
    return Array.from(set)
  }, [messages])

  const [senderMap, setSenderMap] = useState<Record<string, { name: string; role: string }>>({})

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!senderIds.length) {
        setSenderMap({})
        return
      }
      const { data } = await supabase.from('users').select('id, name, role').in('id', senderIds)
      if (cancelled) return
      const map: Record<string, { name: string; role: string }> = {}
      ;(data ?? []).forEach((u) => {
        map[u.id as string] = { name: (u.name as string | null) ?? '-', role: (u.role as string | null) ?? '-' }
      })
      setSenderMap(map)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [senderIds])

  const viewMessages = useMemo<MsgView[]>(() => {
    const out: MsgView[] = []
    messages.forEach((m) => {
      const meta = senderMap[m.sender_id]
      const kind: MsgView['kind'] = user?.id && m.sender_id === user.id ? 'me' : 'other'
      out.push({
        id: m.id,
        kind,
        at: timeHHMM(m.sent_at),
        name: meta?.name,
        role: meta?.role,
        text: m.message,
      })
    })
    return out
  }, [messages, senderMap, user?.id])

  useEffect(() => {
    if (!openChat) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [openChat, viewMessages.length])

  const onSend = async () => {
    const text = draft.trim()
    if (!text) return
    if (!user?.id) return
    await sendMessage(user.id, text)
    setDraft('')
  }

  const resolve = async () => {
    if (!id) return
    const { error: e } = await supabase
      .from('alerts')
      .update({ status: 'RESOLVED', resolved_at: new Date().toISOString() })
      .eq('id', id)
    if (e) {
      pushToast({ type: 'error', title: 'Gagal', message: e.message, durationMs: 6000 })
      return
    }
    pushToast({ type: 'success', title: 'Selesai', message: '✅ Alert berhasil diselesaikan', durationMs: 5000 })
    setResolveOpen(false)
    await refetch()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !alert) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-sm text-slate-300">{error ?? 'Alert tidak ditemukan.'}</div>
        <Link to="/dashboard/alerts" className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
          ← Kembali
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard/alerts" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
          ← Kembali ke Alerts
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-white">{typeLabel(alert.type)} — {alert.location ?? '-'}</div>
          <Chip className={severityChip(alert.severity)}>{alert.severity}</Chip>
          {alert.status === 'ACTIVE' ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />● AKTIF
            </div>
          ) : (
            <Chip className="bg-emerald-600 text-white">✅ SELESAI</Chip>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[55%_45%]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl">{typeLabel(alert.type).split(' ')[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white">{typeLabel(alert.type)}</div>
                <div className="mt-1 text-xs text-slate-400">Dipicu: {new Date(alert.created_at).toLocaleString('id-ID')}</div>
                <div className="mt-1 text-xs text-slate-400">📱 {alert.trigger_source ?? '-'} — {alert.reporter_name ?? '-'}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <div>📍 {alert.address ?? '-'}</div>
              <div>Koordinat: {alert.lat}, {alert.lng}</div>
              <div>ID: {alert.id}</div>
            </div>
            {alert.status === 'ACTIVE' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" onClick={() => setResolveOpen(true)}>
                  ✅ Resolve
                </button>
                <button
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                  onClick={() => {
                    const next = new URLSearchParams(searchParams)
                    next.set('tab', 'chat')
                    navigate({ search: next.toString() }, { replace: true })
                  }}
                >
                  💬 Buka Chat
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-sm font-semibold text-slate-100">Detail Kejadian</div>
            <div className="mt-3 text-sm text-slate-200">{alert.description ?? '—'}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">💬 Chat</div>
            <div className="text-xs text-slate-400">Realtime</div>
          </div>

          <div className="mt-4 h-[420px] overflow-auto rounded-xl border border-white/10 bg-white/5 p-3" ref={listRef}>
            {chatLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : chatError ? (
              <div className="text-sm text-red-200">{chatError}</div>
            ) : viewMessages.length === 0 ? (
              <div className="text-sm text-slate-300">Belum ada pesan.</div>
            ) : (
              <div className="space-y-2">
                {viewMessages.map((m) => (
                  <div key={m.id} className={m.kind === 'me' ? 'flex justify-end' : 'flex justify-start'}>
                    <div className={m.kind === 'me' ? 'max-w-[85%] rounded-2xl bg-blue-600/30 px-3 py-2 text-sm text-slate-100' : 'max-w-[85%] rounded-2xl bg-white/10 px-3 py-2 text-sm text-slate-100'}>
                      {m.kind !== 'me' ? (
                        <div className="mb-1 text-xs text-slate-300">{m.name ?? '-'} • {m.role ?? '-'}</div>
                      ) : null}
                      <div className="whitespace-pre-wrap">{m.text}</div>
                      <div className="mt-1 text-right text-[11px] text-slate-300">{m.at}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-200 hover:bg-white/15" title="Lampiran" type="button">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              className="h-10 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/40"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ketik pesan..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void onSend()
                }
              }}
            />
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500" onClick={() => void onSend()}>
              <Send className="h-4 w-4" /> Kirim
            </button>
          </div>
        </div>
      </div>

      <OverlayModal open={resolveOpen} title="✅ Selesaikan Alert" onClose={() => setResolveOpen(false)}>
        <div className="space-y-3">
          <div className="text-sm text-slate-200">Yakin ingin menyelesaikan alert ini?</div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setResolveOpen(false)}>
              Batal
            </button>
            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500" onClick={() => void resolve()}>
              Ya, Resolve
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}
