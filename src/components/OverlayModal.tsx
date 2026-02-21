import { useEffect } from 'react'
import { X } from 'lucide-react'

import type React from 'react'

export default function OverlayModal({
  open,
  title,
  children,
  onClose,
  widthClassName = 'w-[520px]',
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  widthClassName?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130] bg-black/60" onMouseDown={onClose}>
      <div
        className={`mx-auto mt-20 max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 ${widthClassName}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <button className="rounded-lg p-1 text-slate-300 hover:bg-white/10" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

