import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Maximize2, Minimize2, PanelLeft, SlidersHorizontal, Tv } from 'lucide-react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import AlertBorderEffect from '@/pages/dashboard/live-map/components/AlertBorderEffect'
import HeatmapLayer from '@/pages/dashboard/live-map/components/HeatmapLayer'
import MarkerClusters, { type MapAlert, type UserMarker } from '@/pages/dashboard/live-map/components/MarkerClusters'
import MiniMapControl from '@/pages/dashboard/live-map/components/MiniMapControl'
import { useAlerts, useUsers, type DbAlert, type DbAlertSeverity, type DbUser } from '@/hooks/useSupabase'

const tileLayers = {
  satellite: {
    label: '🛰️ Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
  },
  normal: {
    label: '🗺️ Normal',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
  },
  dark: {
    label: '🌑 Gelap',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
  },
  terrain: {
    label: '🏔️ Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
  },
} as const

function severityRank(s: DbAlertSeverity) {
  if (s === 'CRITICAL') return 0
  if (s === 'HIGH') return 1
  if (s === 'MEDIUM') return 2
  return 3
}

function highestSeverity(alerts: DbAlert[]) {
  const active = alerts.filter((a) => a.status === 'ACTIVE')
  if (active.some((a) => a.severity === 'CRITICAL')) return 'CRITICAL'
  if (active.some((a) => a.severity === 'HIGH')) return 'HIGH'
  if (active.some((a) => a.severity === 'MEDIUM')) return 'MEDIUM'
  if (active.some((a) => a.severity === 'LOW')) return 'LOW'
  return null
}

function MapEvents({ onMove }: { onMove: (p: { lat: number; lng: number; zoom: number }) => void }) {
  useMapEvents({
    mousemove: (e) => onMove({ lat: e.latlng.lat, lng: e.latlng.lng, zoom: e.target.getZoom() }),
    zoomend: (e) => onMove({ lat: e.target.getCenter().lat, lng: e.target.getCenter().lng, zoom: e.target.getZoom() }),
  })
  return null
}

function MapController() {
  const map = useMap()
  useEffect(() => {
    const bounds: [[number, number], [number, number]] = [
      [-11.0, 95.0],
      [6.0, 141.5],
    ]

    map.fitBounds(bounds, { animate: false })

    const onZoomEnd = () => {
      if (map.getZoom() < 5) map.setView([-2.5, 118.0], 5, { animate: true })
    }
    map.on('zoomend', onZoomEnd)
    return () => {
      map.off('zoomend', onZoomEnd)
    }
  }, [map])
  return null
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
    address: a.address,
    reporter_name: a.reporter_name,
    created_at: a.created_at,
  }))
}

export default function LiveMap() {
  const mapRef = useRef<L.Map | null>(null)
  const invalidateRef = useRef<number | null>(null)
  const fullWrapRef = useRef<HTMLDivElement | null>(null)

  const [tile, setTile] = useState<keyof typeof tileLayers>('satellite')
  const [tileOpen, setTileOpen] = useState(false)
  const [layerOpen, setLayerOpen] = useState(false)
  const [showUsers, setShowUsers] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [split, setSplit] = useState(false)

  const [cursor, setCursor] = useState({ lat: -2.5, lng: 118.0, zoom: 5 })
  const [lastUpdate, setLastUpdate] = useState('')

  const [fullscreen, setFullscreen] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const idleRef = useRef<number | null>(null)

  const { alerts: activeAlertsRaw } = useAlerts({ status: 'ACTIVE' })
  const sinceIso = useMemo(() => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), [])
  const { alerts: heatAlertsRaw } = useAlerts({ sinceIso })
  const { users: onlineUsersRaw } = useUsers({ status: 'ACTIVE' })
  const { users: usersRaw } = useUsers({ status: 'ACTIVE', onlyWithLocation: true })

  const highest = useMemo(() => highestSeverity(activeAlertsRaw), [activeAlertsRaw])

  const activeAlerts = useMemo(() => [...activeAlertsRaw].sort((a, b) => severityRank(a.severity) - severityRank(b.severity)), [activeAlertsRaw])

  const onlineCount = useMemo(() => onlineUsersRaw.filter((u) => u.status === 'ACTIVE').length, [onlineUsersRaw])

  const users = useMemo(() => toUserMarkers(usersRaw), [usersRaw])
  const alerts = useMemo(() => toMapAlerts(activeAlertsRaw), [activeAlertsRaw])

  const heatPoints = useMemo(() => {
    return heatAlertsRaw.map((a) => {
      const w = a.severity === 'CRITICAL' ? 1 : a.severity === 'HIGH' ? 0.8 : a.severity === 'MEDIUM' ? 0.6 : 0.45
      return [a.lat, a.lng, w] as [number, number, number]
    })
  }, [heatAlertsRaw])

  useEffect(() => {
    const t = window.setInterval(() => {
      const d = new Date()
      setLastUpdate(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`)
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    const onFs = () => {
      if (!document.fullscreenElement) setFullscreen(false)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [fullscreen])

  useEffect(() => {
    if (!fullscreen) return
    const onMove = () => {
      setOverlayVisible(true)
      if (idleRef.current) window.clearTimeout(idleRef.current)
      idleRef.current = window.setTimeout(() => setOverlayVisible(false), 2500)
    }
    onMove()
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (idleRef.current) window.clearTimeout(idleRef.current)
      idleRef.current = null
    }
  }, [fullscreen])

  const toggleFullscreen = useCallback(async () => {
    if (!fullscreen) {
      try {
        await document.documentElement.requestFullscreen()
      } catch {
        setFullscreen(true)
      }
      setFullscreen(true)
      window.setTimeout(() => mapRef.current?.invalidateSize(), 200)
      return
    }
    try {
      await document.exitFullscreen()
    } catch {
      setFullscreen(false)
    }
    setFullscreen(false)
    window.setTimeout(() => mapRef.current?.invalidateSize(), 200)
  }, [fullscreen])

  useEffect(() => {
    const onToggle = () => {
      void toggleFullscreen()
    }
    window.addEventListener('eas:toggleFullscreen', onToggle as EventListener)
    return () => window.removeEventListener('eas:toggleFullscreen', onToggle as EventListener)
  }, [toggleFullscreen])

  useEffect(() => {
    window.setTimeout(() => mapRef.current?.invalidateSize(), 150)
  }, [split, fullscreen, tile])

  const layoutWrapCls = fullscreen ? 'fixed inset-0 z-[110] bg-[var(--bg)]' : ''
  const toolbarCls = `relative z-50 w-full overflow-visible border-b border-[var(--border)] px-4 py-3 ${fullscreen ? 'bg-[#0f1117cc] backdrop-blur' : 'bg-[var(--panel)]'}`
  const toolbarVis = fullscreen ? (overlayVisible ? 'opacity-100' : 'opacity-0') : 'opacity-100'

  return (
    <div className={layoutWrapCls} ref={fullWrapRef}>
      <AlertBorderEffect severity={highest} />

      <div className={`transition-opacity duration-300 ${toolbarVis}`}>
        <div className={toolbarCls}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setTileOpen((v) => !v)
                  setLayerOpen(false)
                }}
              >
                {tileLayers[tile].label}
                <ChevronDown className="h-4 w-4" />
              </button>
              {tileOpen ? (
                <div className="absolute left-0 top-11 z-[60] w-52 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                  {Object.entries(tileLayers).map(([k, v]) => (
                    <button
                      key={k}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                      onClick={() => {
                        setTile(k as keyof typeof tileLayers)
                        setTileOpen(false)
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setLayerOpen((v) => !v)
                  setTileOpen(false)
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Layer
                <ChevronDown className="h-4 w-4" />
              </button>
              {layerOpen ? (
                <div className="absolute left-0 top-11 z-[60] w-64 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shadow-xl">
                  {[
                    { k: 'users', label: 'User Online', v: showUsers, on: () => setShowUsers((x) => !x) },
                    { k: 'alerts', label: 'Alert Aktif', v: showAlerts, on: () => setShowAlerts((x) => !x) },
                    { k: 'heat', label: 'Heatmap (30 hari)', v: showHeatmap, on: () => setShowHeatmap((x) => !x) },
                  ].map((r) => (
                    <label key={r.k} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <div>{r.v ? '✅' : '☐'} {r.label}</div>
                      <input type="checkbox" checked={r.v} onChange={r.on} />
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold ${split ? 'bg-red-500/15 text-red-200' : 'bg-white/10 text-white hover:bg-white/15'}`}
              onClick={() => setSplit((v) => !v)}
            >
              <PanelLeft className="h-4 w-4" />
              Split View
            </button>

            <Link
              to="/dashboard/live-map/kiosk"
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
            >
              <Tv className="h-4 w-4" />
              Kiosk
            </Link>

            <button
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
              onClick={toggleFullscreen}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {fullscreen ? 'Keluar' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      <div className={split ? 'relative z-0 flex h-[calc(100vh-60px-60px-50px)]' : 'relative z-0 h-[calc(100vh-60px-60px-50px)]'}>
        {split ? (
          <div className="w-[30%] min-w-[280px] border-r border-[var(--border)] bg-[var(--panel)] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">🚨 Alert Aktif</div>
              <div className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-200">{activeAlerts.length}</div>
            </div>
            <div className="mt-4 space-y-2">
              {activeAlerts.map((a) => (
                <button
                  key={a.id}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                  onClick={() => mapRef.current?.flyTo([a.lat, a.lng], 14, { animate: true, duration: 1.2 })}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{a.type} — {a.severity}</div>
                    <div
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.severity === 'CRITICAL'
                          ? 'bg-red-500 text-white'
                          : a.severity === 'HIGH'
                            ? 'bg-orange-500 text-white'
                            : a.severity === 'MEDIUM'
                              ? 'bg-amber-400 text-black'
                              : 'bg-slate-500 text-white'
                      }`}
                    >
                      {a.severity}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-300">{a.location ?? '-'}</div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className={split ? 'relative flex-1' : 'relative h-full'}>
          <div className="absolute inset-0 z-0">
            <MapContainer
              center={[-2.5, 118.0]}
              zoom={5}
              minZoom={5}
              maxZoom={18}
              maxBounds={[
                [-12.0, 94.0],
                [8.0, 142.0],
              ]}
              maxBoundsViscosity={1.0}
              style={{ height: '100%', width: '100%' }}
              ref={(m) => {
                if (!m) return
                mapRef.current = m
                if (invalidateRef.current) window.clearTimeout(invalidateRef.current)
                invalidateRef.current = window.setTimeout(() => {
                  const map = mapRef.current
                  if (!map) return
                  const container = map.getContainer?.()
                  if (!container || !container.isConnected) return
                  map.whenReady(() => {
                    map.invalidateSize({ animate: false })
                  })
                }, 0)
              }}
            >
              <TileLayer
                url={tileLayers[tile].url}
                attribution={tileLayers[tile].attribution}
                minZoom={3}
                maxZoom={18}
                tileSize={256}
                keepBuffer={4}
                updateWhenIdle={false}
                updateWhenZooming={false}
              />
              <MapController />
              <MapEvents onMove={(p) => setCursor(p)} />
              <MarkerClusters enabled={true} showUsers={showUsers} showAlerts={showAlerts} users={users} alerts={alerts} newAlertId={null} />
              <HeatmapLayer enabled={showHeatmap} points={heatPoints} />
              <MiniMapControl />
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="h-[50px] border-t border-[var(--border)] bg-[var(--panel)] px-4">
        <div className="flex h-full items-center justify-between gap-3 text-sm text-slate-200">
          <div className="flex items-center gap-4">
            <div>🟢 {showUsers ? onlineCount : 0} User Online</div>
            <div>🚨 {showAlerts ? activeAlerts.length : 0} Alert Aktif</div>
          </div>
          <div className="text-xs text-slate-300">Koordinat: {cursor.lat.toFixed(3)}, {cursor.lng.toFixed(3)}</div>
          <div className="text-xs text-slate-300">Zoom: {cursor.zoom} | Update: {lastUpdate}</div>
        </div>
      </div>
    </div>
  )
}
