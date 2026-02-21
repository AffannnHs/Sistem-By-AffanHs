import type { DbAlertSeverity } from '@/hooks/useSupabase'

export default function AlertBorderEffect({ severity }: { severity: DbAlertSeverity | null | undefined }) {
  if (!severity) return null
  const anim =
    severity === 'CRITICAL' ? 'border-critical 0.2s infinite' : severity === 'HIGH' ? 'border-high 0.8s infinite' : 'border-medium 1.5s infinite'

  return (
    <div
      className={`fixed inset-0 z-[100] pointer-events-none ${severity === 'CRITICAL' ? 'critical-vignette' : ''}`}
      style={{ animation: anim }}
    />
  )
}

