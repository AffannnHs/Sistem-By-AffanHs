import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useToastStore, type Toast } from '@/stores/toastStore'

function icon(type: Toast['type']) {
  if (type === 'success') return '✅'
  if (type === 'error') return '❌'
  if (type === 'warning') return '⚠️'
  if (type === 'info') return 'ℹ️'
  return '🚨'
}

function styles(type: Toast['type']) {
  if (type === 'success') return { bg: '#14532d', border: '#22c55e' }
  if (type === 'error') return { bg: '#7f1d1d', border: '#ef4444' }
  if (type === 'warning') return { bg: '#713f12', border: '#eab308' }
  if (type === 'info') return { bg: '#1e3a5f', border: '#3b82f6' }
  return { bg: '#7f1d1d', border: '#ef4444' }
}

export default function ToastManager() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  useEffect(() => {
    const timers = toasts.map((t) =>
      window.setTimeout(() => {
        dismiss(t.id)
      }, t.durationMs),
    )
    return () => {
      timers.forEach((x) => window.clearTimeout(x))
    }
  }, [dismiss, toasts])

  return (
    <div className="fixed right-4 top-4 z-[200] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-3">
      {toasts.map((t) => {
        const st = styles(t.type)
        const isAlert = t.type === 'alert'
        return (
          <div
            key={t.id}
            style={{ background: st.bg, borderColor: st.border }}
            className={`relative overflow-hidden rounded-xl border px-4 py-3 shadow-lg transition-all ${
              isAlert ? 'min-h-[92px]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-lg">{icon(t.type)}</div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold ${isAlert ? 'text-base' : ''}`}>{t.title}</div>
                {t.message ? <div className="mt-0.5 text-xs text-white/85">{t.message}</div> : null}
                {t.action ? (
                  <button
                    className="mt-3 inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15"
                    onClick={() => {
                      t.action?.onClick()
                      dismiss(t.id)
                    }}
                  >
                    {t.action.label}
                  </button>
                ) : null}
              </div>
              <button
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div
              className="absolute bottom-0 left-0 h-[3px] w-full"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <div
                className="h-full"
                style={{
                  background: st.border,
                  width: '100%',
                  transformOrigin: 'left',
                  animation: `toast-progress ${t.durationMs}ms linear forwards`,
                }}
              />
            </div>
          </div>
        )
      })}
      <style>
        {`@keyframes toast-progress { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}
      </style>
    </div>
  )
}

