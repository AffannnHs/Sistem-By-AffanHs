import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import AlertBorderEffect from '@/pages/dashboard/live-map/components/AlertBorderEffect'
import MarkerClusters, { type UserMarker } from '@/pages/dashboard/live-map/components/MarkerClusters'
import { alerts as baseAlerts } from '@/mock/data'
import type { Severity } from '@/mock/types'

const tile = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles © Esri',
}

const userMarkers: UserMarker[] = [
  { id: 1, name: 'Dewi Kusuma', role: 'COORDINATOR', lat: -6.5021, lng: 106.8487, status: 'EN_ROUTE', alertId: 'ALT-1001' },
  { id: 2, name: 'Eko Prasetyo', role: 'COORDINATOR', lat: -6.3821, lng: 106.8187, status: 'ONLINE' },
  { id: 3, name: 'Gunawan Wijaya', role: 'MEMBER', lat: -6.4621, lng: 106.8887, status: 'ONLINE' },
  { id: 4, name: 'Hana Pertiwi', role: 'MEMBER', lat: -6.5221, lng: 106.9087, status: 'ONLINE' },
]

export default function Kiosk() {
  const mapRef = useRef<L.Map | null>(null)
  const alerts = useMemo(() => baseAlerts, [])
  const active = alerts.filter((a) => a.status !== 'SELESAI')
  const severity: Severity | null = useMemo(() => (active.some((a) => a.severity === 'CRITICAL') ? 'CRITICAL' : null), [active])

  const [now, setNow] = useState('')
  const [refresh, setRefresh] = useState(30)
  const [flash, setFlash] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => {
      const d = new Date()
      setNow(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} WIB`)
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const t = window.setInterval(() => {
      setRefresh((r) => {
        if (r <= 1) {
          setFlash(true)
          window.setTimeout(() => setFlash(false), 250)
          return 30
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const t = window.setInterval(() => {
      setFocusIdx((i) => i + 1)
    }, 15000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const idx = focusIdx % 3
    if (idx === 0 && active[0]) {
      map.flyTo([active[0].lat, active[0].lng], 14, { animate: true, duration: 1.5 })
    } else if (idx === 1 && active[1]) {
      map.flyTo([active[1].lat, active[1].lng], 14, { animate: true, duration: 1.5 })
    } else {
      map.flyTo([-2.5, 118.0], 5, { animate: true, duration: 1.5 })
    }
  }, [active, focusIdx])

  const ticker = active
    .map((a) => {
      const dot = a.severity === 'CRITICAL' ? '🔴' : a.severity === 'HIGH' ? '🟠' : '🟡'
      return `${dot} ${a.severity}: ${a.typeLabel} — ${a.location} — ${a.timeLabel}`
    })
    .join('  ●  ')

  return (
    <div className="fixed inset-0 bg-[var(--bg)]">
      <AlertBorderEffect severity={severity ?? undefined} />
      <div className={`h-[60px] border-b border-red-500/40 bg-[var(--bg)] px-6 ${flash ? 'bg-red-500/10' : ''}`}>
        <div className="flex h-full items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white">🚨 EMERGENCY ALERT SYSTEM — PUSAT KOMANDO</div>
          <div className="flex items-center gap-4 text-xs text-slate-200">
            <div>🟢 Sistem Online</div>
            <div>{userMarkers.length} Online</div>
            <div>{active.length} Alert Aktif</div>
            <div>Refresh: 00:{String(refresh).padStart(2, '0')}</div>
            <div className="text-sm font-semibold text-white">{now}</div>
          </div>
        </div>
      </div>

      <div className="relative h-[calc(100vh-60px-40px)]">
        <MapContainer
          center={[-2.5, 118.0]}
          zoom={5}
          minZoom={4}
          maxZoom={18}
          style={{ height: '100%', width: '100%' }}
          ref={(m) => {
            if (!m) return
            mapRef.current = m
            window.setTimeout(() => m.invalidateSize(), 50)
          }}
        >
          <TileLayer url={tile.url} attribution={tile.attribution} />
          <MarkerClusters enabled={true} showUsers={true} showAlerts={true} users={userMarkers} alerts={alerts} newAlertId={null} />
        </MapContainer>

        <div className="absolute left-4 top-4 z-20 w-[280px] rounded-2xl bg-[#0f1117bb] p-4 backdrop-blur">
          <div className="text-sm font-semibold text-white">📊 STATUS REAL-TIME</div>
          <div className="mt-3 space-y-1 text-sm text-slate-200">
            <div>Alert Aktif : {active.length}</div>
            <div className="text-xs text-slate-300">├ CRITICAL : {active.filter((a) => a.severity === 'CRITICAL').length} 🔴</div>
            <div className="text-xs text-slate-300">├ HIGH : {active.filter((a) => a.severity === 'HIGH').length} 🟠</div>
            <div className="text-xs text-slate-300">└ MEDIUM : {active.filter((a) => a.severity === 'MEDIUM').length} 🟡</div>
            <div className="mt-2">Responder Online : 8</div>
            <div>Admin Online : 3</div>
            <div className="mt-2 text-xs text-slate-300">Update terakhir: {now.split(' ')[0]}</div>
          </div>
        </div>

        <Link
          to="/dashboard/live-map"
          className="absolute bottom-4 right-4 z-20 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>

      <div className="h-[40px] overflow-hidden border-t border-[var(--border)] bg-[var(--panel)]">
        <div className="ticker-content flex h-full items-center px-6 text-sm text-slate-200" style={{ animation: 'ticker-scroll 30s linear infinite', whiteSpace: 'nowrap' }}>
          {ticker}  ●  {ticker}
        </div>
        <style>
          {`@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}
        </style>
      </div>
    </div>
  )
}

