import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'

const rows = [
  { key: 'F', desc: 'Fullscreen peta (di Live Map)' },
  { key: 'K', desc: 'Kiosk mode' },
  { key: 'Ctrl + F', desc: 'Fokus ke input search' },
  { key: 'ESC', desc: 'Tutup modal/drawer' },
  { key: 'G + D', desc: 'Ke Dashboard' },
  { key: 'G + M', desc: 'Ke Live Map' },
  { key: 'G + A', desc: 'Ke Alerts' },
  { key: 'G + U', desc: 'Ke Users' },
  { key: '?', desc: 'Tampilkan modal ini' },
]

export default function ShortcutsModal() {
  const open = useUIStore((s) => s.shortcutsOpen)
  const setOpen = useUIStore((s) => s.setShortcutsOpen)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] bg-black/60" onMouseDown={() => setOpen(false)}>
      <div
        className="mx-auto mt-24 w-[520px] max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-semibold">⌨️ Keyboard Shortcuts</div>
        <div className="mt-4 space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-4 rounded-xl bg-white/5 px-3 py-2">
              <div className="text-xs font-semibold text-slate-100">{r.key}</div>
              <div className="text-xs text-slate-300">{r.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            onClick={() => {
              setOpen(false)
              navigate('/dashboard')
            }}
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}

