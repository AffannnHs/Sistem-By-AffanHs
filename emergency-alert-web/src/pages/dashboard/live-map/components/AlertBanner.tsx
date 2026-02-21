import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { Alert } from '@/mock/types'

export default function AlertBanner({
  alert,
  onClose,
  onView,
}: {
  alert: Alert | null
  onClose: () => void
  onView: () => void
}) {
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState(10)

  useEffect(() => {
    if (!alert) return
    setOpen(true)
    setLeft(10)
  }, [alert])

  useEffect(() => {
    if (!alert || !open) return
    const t = window.setInterval(() => setLeft((v) => (v <= 0 ? 0 : v - 1)), 1000)
    return () => window.clearInterval(t)
  }, [alert, open])

  useEffect(() => {
    if (!alert) return
    if (left > 0) return
    const t = window.setTimeout(() => {
      setOpen(false)
      onClose()
    }, 200)
    return () => window.clearTimeout(t)
  }, [alert, left, onClose])

  const bar = useMemo(() => `${(left / 10) * 100}%`, [left])

  if (!alert) return null

  return (
    <div
      className="fixed left-1/2 top-3 z-[140] w-[720px] max-w-[calc(100vw-24px)] -translate-x-1/2"
      style={{
        transform: `translate(-50%, ${open ? '0' : '-24px'})`,
        opacity: open ? 1 : 0,
        transition: 'all 250ms ease',
      }}
    >
      <div className="rounded-2xl border border-red-500 bg-[#7f1d1d] px-5 py-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">🔴 ⚠️ ALERT {alert.severity} BARU — {alert.location}</div>
            <div className="mt-1 text-sm text-white/85">{alert.typeLabel} — Dipicu oleh: {alert.reporter}</div>
            <div className="mt-1 text-xs text-white/70">Baru saja</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={onView}>
                🗺️ Lihat di Peta
              </button>
              <button
                className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                onClick={() => {
                  setOpen(false)
                  onClose()
                }}
              >
                Tutup
              </button>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              setOpen(false)
              onClose()
            }}
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-2 bg-red-300" style={{ width: bar, transition: 'width 1s linear' }} />
        </div>
      </div>
    </div>
  )
}

