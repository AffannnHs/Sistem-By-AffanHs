import { useEffect } from 'react'
import { X } from 'lucide-react'

import type React from 'react'

export default function RightDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
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
    <div className="fixed inset-0 z-[125] bg-black/60" onMouseDown={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-[380px] max-w-[calc(100vw-24px)] border-l border-[var(--border)] bg-[var(--panel)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex h-[60px] items-center justify-between border-b border-[var(--border)] px-4">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={onClose} aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-auto p-4">{children}</div>
      </div>
    </div>
  )
}

