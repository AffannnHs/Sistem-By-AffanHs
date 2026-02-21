import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Paperclip, Send } from 'lucide-react'
import OverlayModal from '@/components/OverlayModal'
import Chip from '@/components/Chip'
import { useToastStore } from '@/stores/toastStore'
import { alerts } from '@/mock/data'
import type { Severity } from '@/mock/types'
import { useSessionStore } from '@/stores/sessionStore'

type Msg = {
  id: string
  kind: 'system' | 'me' | 'other'
  at: string
  name?: string
  role?: string
  text: string
}

function severityChip(s: Severity) {
  if (s === 'CRITICAL') return 'bg-red-500 text-white'
  if (s === 'HIGH') return 'bg-orange-500 text-white'
  if (s === 'MEDIUM') return 'bg-amber-400 text-black'
  return 'bg-slate-500 text-white'
}

export default function AlertDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const openChat = searchParams.get('tab') === 'chat'

  const pushToast = useToastStore((s) => s.push)
  const user = useSessionStore((s) => s.user)

  const alert = useMemo(() => alerts.find((a) => a.id === id) ?? null, [id])
  const [resolveOpen, setResolveOpen] = useState(false)

  const [countdown, setCountdown] = useState(alert?.escalationCountdownSec ?? 45)
  useEffect(() => {
    if (!alert) return
    setCountdown(alert.escalationCountdownSec ?? 45)
  }, [alert])

  useEffect(() => {
    if (!alert) return
    if (alert.status === 'SELESAI') return
    const t = window.setInterval(() => {
      setCountdown((c) => (c <= 0 ? 0 : c - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [alert])

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: 'm1',
      kind: 'system',
      at: '14:23',
      text: 'Alert 🔥 KEBAKARAN dipicu oleh Budi Santoso di Jl. Raya Cibinong No. 12',
    },
    {
      id: 'm2',
      kind: 'other',
      at: '14:24',
      name: 'Budi Santoso',
      role: 'MEMBER',
      text: 'Api sudah di lantai 2! Butuh bantuan segera, ada 3 orang masih di dalam!',
    },
    {
      id: 'm3',
      kind: 'other',
      at: '14:24',
      name: 'Dewi Kusuma',
      role: 'COORDINATOR',
      text: 'Saya sudah dalam perjalanan, ETA 8 menit. Koordinat saya sudah dikirim.',
    },
    {
      id: 'm4',
      kind: 'other',
      at: '14:25',
      name: 'Eko Prasetyo',
      role: 'COORDINATOR',
      text: 'Saya 5 km dari lokasi, segera kesana',
    },
    {
      id: 'm5',
      kind: 'me',
      at: '14:25',
      text: 'Tim PMK sudah dihubungi, ETA 10 menit',
    },
    {
      id: 'm6',
      kind: 'system',
      at: '14:26',
      text: 'Dewi Kusuma mengubah status: Sedang Menuju Lokasi',
    },
  ])

  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!openChat) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, openChat])

  if (!alert) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <div className="text-sm text-slate-300">Alert tidak ditemukan.</div>
        <Link to="/dashboard/alerts" className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
          ← Kembali
        </Link>
      </div>
    )
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    const at = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setMessages((m) => [
      ...m,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        kind: 'me',
        at,
        text,
      },
    ])
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard/alerts" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
          ← Kembali ke Alerts
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-white">{alert.typeLabel} — {alert.location}</div>
          <Chip className={severityChip(alert.severity)}>{alert.severity}</Chip>
          {alert.status === 'AKTIF' ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />● AKTIF
            </div>
          ) : alert.status === 'ESKALASI' ? (
            <Chip className="bg-orange-500 text-white animate-pulse">⚡ ESKALASI</Chip>
          ) : (
            <Chip className="bg-emerald-600 text-white">✅ SELESAI</Chip>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[55%_45%]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-3xl">{alert.typeIcon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white">{alert.typeLabel}</div>
                <div className="mt-1 text-xs text-slate-400">Dipicu: Sabtu, 21 Feb 2026 pukul 14:23 WIB</div>
                <div className="mt-1 text-xs text-slate-400">📱 {alert.trigger} — {alert.reporter}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="text-sm font-semibold text-slate-100">Detail Kejadian</div>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div>📍 Lokasi: {alert.address}</div>
              <div>🌐 Koordinat: {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</div>
              <div className="text-slate-300">📝 Keterangan: “{alert.description ?? '-'}”</div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-sm font-semibold text-slate-100">Timeline Eskalasi</div>
            <div className="mt-4 space-y-3">
              {[
                { t: '14:23:05', txt: `Alert dipicu oleh ${alert.reporter}` , done: true },
                { t: '14:23:05', txt: 'Level 1: Admin dinotifikasi', done: true },
                { t: '14:24:17', txt: 'Admin acknowledged (1m 12d)', done: true },
                { t: '14:24:17', txt: 'Level 2: 3 user terdekat dinotifikasi', done: alert.escalationLevel >= 2 },
                { t: '', txt: `Level 3: Broadcast semua anggota dalam → 00:${String(countdown).padStart(2, '0')}`, done: false, pending: true },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        r.done ? 'bg-emerald-400' : r.pending ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    {i < 4 ? <div className="mt-1 h-6 w-px bg-white/10" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-slate-300">{r.t ? `✅ ${r.t}` : ''}</div>
                    <div className={`text-sm ${r.pending ? 'font-semibold text-red-200' : 'text-slate-200'}`}>{r.txt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <div className="text-sm font-semibold text-slate-100">Responder</div>
            <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
              {[
                {
                  name: 'Dewi Kusuma',
                  role: 'COORDINATOR',
                  status: '🔵 Sedang Menuju Lokasi',
                  meta: 'ETA: ~8 menit  │  Jarak: 3.2 km dari TKP',
                  sub: 'Update GPS: 45 detik lalu',
                },
                {
                  name: 'Eko Prasetyo',
                  role: 'COORDINATOR',
                  status: '✅ Sudah Tahu (Acknowledged)',
                  meta: 'Jarak: 5.1 km dari TKP',
                  sub: '',
                },
                {
                  name: 'Gunawan Wijaya',
                  role: 'MEMBER',
                  status: '📬 Baru Dinotifikasi',
                  meta: 'Belum respons',
                  sub: '',
                },
              ].map((r) => (
                <div key={r.name} className="bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">👤 {r.name}</div>
                    <Chip className="bg-white/10 text-slate-200">{r.role}</Chip>
                  </div>
                  <div className="mt-2 text-sm text-slate-200">{r.status}</div>
                  <div className="mt-1 text-xs text-slate-400">{r.meta}</div>
                  {r.sub ? <div className="mt-1 text-xs text-slate-400">{r.sub}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">👤 Assign Responder Tambahan</button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => setResolveOpen(true)}
            >
              ✅ Tandai Selesai
            </button>
            <button className="rounded-xl border border-red-500/50 bg-transparent px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10">❌ Batalkan Alert</button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-100">💬 Chat Darurat</div>
              <div className="mt-1 text-xs text-slate-400">{alert.typeLabel} — {alert.location} | 5 anggota aktif</div>
            </div>
            <Link
              to={`/dashboard/alerts/${alert.id}${openChat ? '' : '?tab=chat'}`}
              className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              {openChat ? 'Mode Chat' : 'Buka Chat'}
            </Link>
          </div>

          <div ref={listRef} className="mt-4 h-[520px] overflow-auto rounded-xl border border-white/10 bg-[var(--card)] p-4">
            <div className="mb-4 text-center text-xs text-slate-400">─── Sabtu, 21 Feb 2026 ─────────────────</div>
            {messages.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-5xl">💬</div>
                <div className="mt-3 text-sm font-semibold text-white">Belum ada pesan</div>
                <div className="mt-1 text-xs text-slate-300">Mulai komunikasi darurat di sini</div>
              </div>
            ) : (
              messages.map((m) => {
                if (m.kind === 'system') {
                  return (
                    <div key={m.id} className="my-4 rounded-xl bg-white/5 px-4 py-3 text-center text-xs italic text-slate-300">
                      [{m.at}] 🔴 SISTEM — {m.text}
                    </div>
                  )
                }
                if (m.kind === 'me') {
                  return (
                    <div key={m.id} className="mb-3 flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-blue-700 px-4 py-3 text-sm text-white">
                        <div className="text-[11px] text-white/80">[{m.at}] Anda ({user?.role ?? 'ADMIN'})</div>
                        <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={m.id} className="mb-3 flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-[var(--panel)] px-4 py-3 text-sm text-white">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span>[{m.at}] {m.name}</span>
                        <Chip className="bg-white/10 text-slate-200">{m.role}</Chip>
                      </div>
                      <div className="mt-1 whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2">
            <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Lampirkan">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              className="h-10 flex-1 rounded-xl bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-400"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ketik pesan darurat..."
            />
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500"
              onClick={send}
            >
              Kirim
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <OverlayModal open={resolveOpen} title="✅ Konfirmasi" onClose={() => setResolveOpen(false)} widthClassName="w-[480px]">
        <div className="text-sm text-slate-200">Tandai alert ini sebagai selesai? Semua responder akan dinotifikasi.</div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setResolveOpen(false)}>
            Batal
          </button>
          <button
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            onClick={() => {
              setResolveOpen(false)
              pushToast({ type: 'success', title: 'Selesai', message: `✅ Alert ${alert.id} ditandai selesai (simulasi).`, durationMs: 5000 })
            }}
          >
            ✅ Ya, Selesaikan
          </button>
        </div>
      </OverlayModal>
    </div>
  )
}

