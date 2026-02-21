import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import AlertBorderEffect from '@/pages/dashboard/live-map/components/AlertBorderEffect'
import MarkerClusters, { type MapAlert, type UserMarker } from '@/pages/dashboard/live-map/components/MarkerClusters'
import { useAlerts, useUsers, type DbAlert, type DbAlertSeverity, type DbUser } from '@/hooks/useSupabase'

const tile = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles © Esri',
}

function highestSeverity(alerts: DbAlert[]) {
  const active = alerts.filter((a) => a.status === 'ACTIVE')
  if (active.some((a) => a.severity === 'CRITICAL')) return 'CRITICAL'
  if (active.some((a) => a.severity === 'HIGH')) return 'HIGH'
  if (active.some((a) => a.severity === 'MEDIUM')) return 'MEDIUM'
  if (active.some((a) => a.severity === 'LOW')) return 'LOW'
  return null
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

function toUserMarkers(rows: DbUser[]): UserMarker[] {
  return rows
    .filter((u) => u.last_lat != null && u.last_lng != null)
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.email ?? 'User',
      role: (u.role ?? 'MEMBER') as UserMarker['role'],
      lat: u.last_lat as number,
      lng: u.last_lng as number,
      last_seen_at: u.last_seen_at,
    }))
}

function toMapAlerts(rows: DbAlert[]): MapAlert[] {
  return rows.map((a) => ({
    id: a.id,
    type: a.type,
    severity: a.severity,
    status: a.status,
    lat: a.lat,
    lng: a.lng,
    location: a.location,
    reporter_name: a.reporter_name,
    created_at: a.created_at,
  }))
}

export default function Kiosk() {
  const mapRef = useRef<L.Map | null>(null)
  const { alerts: activeAlertsRaw } = useAlerts({ status: 'ACTIVE' })
  const { users: usersRaw } = useUsers({ status: 'ACTIVE', onlyWithLocation: true })

  const severity: DbAlertSeverity | null = useMemo(() => highestSeverity(activeAlertsRaw), [activeAlertsRaw])

  const users = useMemo(() => toUserMarkers(usersRaw), [usersRaw])
  const alerts = useMemo(() => toMapAlerts(activeAlertsRaw), [activeAlertsRaw])

  const [now, setNow] = useState('')
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
      setFocusIdx((i) => i + 1)
    }, 15000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!alerts.length) {
      map.flyTo([-2.5, 118.0], 5, { animate: true, duration: 1.2 })
      return
    }
    const idx = focusIdx % Math.min(3, alerts.length)
    const a = alerts[idx]
    map.flyTo([a.lat, a.lng], 13, { animate: true, duration: 1.2 })
  }, [alerts, focusIdx])

  const ticker = useMemo(() => {
    if (!alerts.length) return '🟢 Tidak ada alert aktif'
    return alerts
      .slice(0, 8)
      .map((a) => {
        const dot = a.severity === 'CRITICAL' ? '🔴' : a.severity === 'HIGH' ? '🟠' : a.severity === 'MEDIUM' ? '🟡' : '⚪'
        return `${dot} ${a.severity}: ${a.type} — ${a.location ?? '-'} — ${a.created_at ? fromNowLabel(a.created_at) : ''}`
      })
      .join('  ●  ')
  }, [alerts])

  return (
    <div className="fixed inset-0 bg-[var(--bg)]">
      <AlertBorderEffect severity={severity} />
      <div className="h-[60px] border-b border-[var(--border)] bg-[var(--bg)]/85 px-6 backdrop-blur">
        <div className="flex h-full items-center justify-between gap-4">
          <div className="text-sm font-semibold text-white">🚨 EMERGENCY ALERT SYSTEM — KIOSK</div>
          <div className="flex items-center gap-4 text-xs text-slate-200">
            <div>🟢 Online</div>
            <div>{users.length} User</div>
            <div>{alerts.length} Alert Aktif</div>
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
          <MarkerClusters enabled={true} showUsers={true} showAlerts={true} users={users} alerts={alerts} newAlertId={null} />
        </MapContainer>

        <div className="absolute left-4 top-4 z-20 w-[280px] rounded-2xl bg-[#0f1117bb] p-4 backdrop-blur">
          <div className="text-sm font-semibold text-white">📊 STATUS</div>
          <div className="mt-3 space-y-1 text-sm text-slate-200">
            <div>Alert Aktif : {alerts.length}</div>
            <div className="text-xs text-slate-300">CRITICAL : {alerts.filter((a) => a.severity === 'CRITICAL').length}</div>
            <div className="text-xs text-slate-300">HIGH : {alerts.filter((a) => a.severity === 'HIGH').length}</div>
            <div className="text-xs text-slate-300">MEDIUM : {alerts.filter((a) => a.severity === 'MEDIUM').length}</div>
            <div className="text-xs text-slate-300">LOW : {alerts.filter((a) => a.severity === 'LOW').length}</div>
            <div className="mt-2">User Online : {users.length}</div>
          </div>
        </div>

        <Link to="/dashboard/live-map" className="absolute bottom-4 right-4 z-20 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15">
          ← Kembali
        </Link>
      </div>

      <div className="h-[40px] overflow-hidden border-t border-[var(--border)] bg-[var(--panel)]">
        <div className="ticker-content flex h-full items-center px-6 text-sm text-slate-200" style={{ animation: 'ticker-scroll 30s linear infinite', whiteSpace: 'nowrap' }}>
          {ticker}  ●  {ticker}
        </div>
        <style>{`@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
      </div>
    </div>
  )
}
