import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Maximize2, Minimize2, PanelLeft, Siren, SlidersHorizontal, StopCircle, Tv } from 'lucide-react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import AlertBorderEffect from '@/pages/dashboard/live-map/components/AlertBorderEffect'
import AlertBanner from '@/pages/dashboard/live-map/components/AlertBanner'
import HeatmapLayer from '@/pages/dashboard/live-map/components/HeatmapLayer'
import MarkerClusters, { type UserMarker } from '@/pages/dashboard/live-map/components/MarkerClusters'
import MiniMapControl from '@/pages/dashboard/live-map/components/MiniMapControl'
import { flyToAlert, isInViewport } from '@/pages/dashboard/live-map/useMapAnimation'
import { alerts as baseAlerts } from '@/mock/data'
import type { Alert, Severity } from '@/mock/types'
import OverlayModal from '@/components/OverlayModal'
import { useToastStore } from '@/stores/toastStore'
import { useSessionStore } from '@/stores/sessionStore'

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

const userMarkers: UserMarker[] = [
  { id: 1, name: 'Dewi Kusuma', role: 'COORDINATOR', lat: -6.5021, lng: 106.8487, status: 'EN_ROUTE', alertId: 'ALT-1001' },
  { id: 2, name: 'Eko Prasetyo', role: 'COORDINATOR', lat: -6.3821, lng: 106.8187, status: 'ONLINE' },
  { id: 3, name: 'Gunawan Wijaya', role: 'MEMBER', lat: -6.4621, lng: 106.8887, status: 'ONLINE' },
  { id: 4, name: 'Hana Pertiwi', role: 'MEMBER', lat: -6.5221, lng: 106.9087, status: 'ONLINE' },
]

function highestSeverity(alerts: Alert[]) {
  const active = alerts.filter((a) => a.status !== 'SELESAI')
  if (active.some((a) => a.severity === 'CRITICAL')) return 'CRITICAL'
  if (active.some((a) => a.severity === 'HIGH')) return 'HIGH'
  if (active.some((a) => a.severity === 'MEDIUM')) return 'MEDIUM'
  if (active.some((a) => a.severity === 'LOW')) return 'LOW'
  return null
}

function severitySummary(alerts: Alert[]) {
  const active = alerts.filter((a) => a.status !== 'SELESAI')
  const crit = active.filter((a) => a.severity === 'CRITICAL').length
  if (crit) return `🔴 ${crit} CRITICAL`
  return 'Semua Aman 🟢'
}

function MapEvents({ onMove }: { onMove: (p: { lat: number; lng: number; zoom: number }) => void }) {
  useMapEvents({
    mousemove: (e) => onMove({ lat: e.latlng.lat, lng: e.latlng.lng, zoom: e.target.getZoom() }),
    zoomend: (e) => onMove({ lat: e.target.getCenter().lat, lng: e.target.getCenter().lng, zoom: e.target.getZoom() }),
  })
  return null
}

export default function LiveMap() {
  const pushToast = useToastStore((s) => s.push)
  const user = useSessionStore((s) => s.user)
  const isSuper = user?.role === 'SUPER_ADMIN'

  const mapRef = useRef<L.Map | null>(null)
  const fullWrapRef = useRef<HTMLDivElement | null>(null)
  const invalidateRef = useRef<number | null>(null)

  const [tile, setTile] = useState<keyof typeof tileLayers>('satellite')
  const [tileOpen, setTileOpen] = useState(false)
  const [layerOpen, setLayerOpen] = useState(false)
  const [showUsers, setShowUsers] = useState(true)
  const [showAlerts, setShowAlerts] = useState(true)
  const [showBatas, setShowBatas] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [split, setSplit] = useState(false)

  const [cursor, setCursor] = useState({ lat: -2.5, lng: 118.0, zoom: 5 })
  const [lastUpdate, setLastUpdate] = useState('')

  const [fullscreen, setFullscreen] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const idleRef = useRef<number | null>(null)

  const [simOpen, setSimOpen] = useState(false)
  const [simSeverity, setSimSeverity] = useState<Severity | null>(null)
  const [newAlertId, setNewAlertId] = useState<string | null>(null)
  const [bannerAlert, setBannerAlert] = useState<Alert | null>(null)
  const [demoOn, setDemoOn] = useState(false)

  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [recipientToast, setRecipientToast] = useState(false)

  const [coordMode, setCoordMode] = useState<'OFF' | 'EN_ROUTE' | 'ARRIVED'>('OFF')
  const [coordOpen, setCoordOpen] = useState(false)
  const [coordPos, setCoordPos] = useState<[number, number]>([-6.5021, 106.8487])
  const [coordSpeed, setCoordSpeed] = useState(42)
  const [coordProgress, setCoordProgress] = useState(75)
  const [coordEtaSec, setCoordEtaSec] = useState(8 * 60)
  const coordMoveRef = useRef<number | null>(null)
  const coordProgRef = useRef<number | null>(null)

  const alerts = useMemo(() => baseAlerts, [])
  const severity = useMemo(() => (demoOn && simSeverity ? simSeverity : highestSeverity(alerts)), [alerts, demoOn, simSeverity])

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
      idleRef.current = window.setTimeout(() => setOverlayVisible(false), 3000)
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

  const stopDemo = () => {
    setDemoOn(false)
    setSimSeverity(null)
    setNewAlertId(null)
    setBannerAlert(null)
    mapRef.current?.flyTo([-2.5, 118.0], 5, { animate: true, duration: 1.5 })
  }

  const startSim = async (mode: 'in' | 'out') => {
    const map = mapRef.current
    if (!map) return
    setDemoOn(true)
    setSimSeverity('CRITICAL')

    const sim: Alert =
      mode === 'in'
        ? {
            id: 'SIM-BOGOR',
            type: 'FIRE',
            typeLabel: '🔥 KEBAKARAN',
            typeIcon: '🔥',
            severity: 'CRITICAL',
            status: 'AKTIF',
            address: 'Bogor (simulasi dalam area)',
            location: 'Bogor',
            reporter: 'Demo System',
            trigger: 'Simulasi',
            timeLabel: 'baru saja',
            lat: -6.595,
            lng: 106.816,
            escalationLevel: 2,
            escalationCountdownSec: 45,
            responder: { notified: 4, ack: 3, enRoute: 1 },
          }
        : {
            id: 'SIM-PONTIANAK',
            type: 'FIRE',
            typeLabel: '🔥 KEBAKARAN',
            typeIcon: '🔥',
            severity: 'CRITICAL',
            status: 'AKTIF',
            address: 'Pontianak, Kalimantan Barat',
            location: 'Pontianak, Kalimantan Barat',
            reporter: 'Reza Firmansyah',
            trigger: 'Simulasi',
            timeLabel: 'baru saja',
            lat: -0.0263,
            lng: 109.3425,
            escalationLevel: 2,
            escalationCountdownSec: 45,
            responder: { notified: 4, ack: 3, enRoute: 1 },
          }

    setNewAlertId(sim.id)
    await flyToAlert({
      map,
      lat: sim.lat,
      lng: sim.lng,
      isOutsideViewport: mode === 'out' ? true : !isInViewport(map, sim.lat, sim.lng),
      onShowBanner: () => setBannerAlert(sim),
      onTriggerMarker: () => setNewAlertId(sim.id),
    })
  }

  const startCoordinator = () => {
    setCoordMode('EN_ROUTE')
    setCoordProgress(75)
    setCoordEtaSec(8 * 60)
    setCoordSpeed(42)
    setCoordPos([-6.5021, 106.8487])

    pushToast({
      type: 'info',
      title: '🔵 Coordinator sedang menuju lokasi darurat',
      message: 'Dewi Kusuma → 🔥 Kebakaran Cibinong | ETA: ~8 menit',
      durationMs: 5000,
    })

    setRecipientToast(true)
    window.setTimeout(() => setRecipientToast(false), 5000)

    if (coordProgRef.current) window.clearInterval(coordProgRef.current)
    coordProgRef.current = window.setInterval(() => {
      setCoordProgress((p) => (p >= 100 ? 100 : p + 1))
      setCoordEtaSec((s) => (s <= 0 ? 0 : s - 5))
      setCoordSpeed(() => 30 + Math.round(Math.random() * 25))
    }, 5000)

    if (coordMoveRef.current) window.clearInterval(coordMoveRef.current)
    coordMoveRef.current = window.setInterval(() => {
      const target: [number, number] = [-6.4821, 106.8287]
      setCoordPos((pos) => {
        const [lat, lng] = pos
        const [tLat, tLng] = target
        const moveStep = 0.001
        const dLat = tLat - lat
        const dLng = tLng - lng
        const mag = Math.max(0.000001, Math.sqrt(dLat * dLat + dLng * dLng))
        const nLat = lat + (dLat / mag) * moveStep
        const nLng = lng + (dLng / mag) * moveStep
        return [nLat, nLng]
      })
    }, 10000)
  }

  const arriveCoordinator = () => {
    setCoordMode('ARRIVED')
    setCoordProgress(100)
    setCoordEtaSec(0)
    pushToast({ type: 'success', title: '🟢 Dewi Kusuma telah tiba di TKP', message: 'Route berubah hijau.', durationMs: 5000 })
    if (coordProgRef.current) window.clearInterval(coordProgRef.current)
    if (coordMoveRef.current) window.clearInterval(coordMoveRef.current)
    window.setTimeout(() => {
      setCoordMode('OFF')
    }, 5000)
  }

  const resetCoordinator = () => {
    setCoordMode('OFF')
    if (coordProgRef.current) window.clearInterval(coordProgRef.current)
    if (coordMoveRef.current) window.clearInterval(coordMoveRef.current)
  }

  useEffect(() => {
    return () => {
      if (invalidateRef.current) window.clearTimeout(invalidateRef.current)
      if (coordProgRef.current) window.clearInterval(coordProgRef.current)
      if (coordMoveRef.current) window.clearInterval(coordMoveRef.current)
    }
  }, [])

  const layoutWrapCls = fullscreen ? 'fixed inset-0 z-[110] bg-[var(--bg)]' : ''
  const toolbarCls = `relative z-50 w-full overflow-visible border-b border-[var(--border)] px-4 py-3 ${fullscreen ? 'bg-[#0f1117cc] backdrop-blur' : 'bg-[var(--panel)]'}`
  const toolbarVis = fullscreen ? (overlayVisible ? 'opacity-100' : 'opacity-0') : 'opacity-100'

  const activeAlerts = alerts.filter((a) => a.status !== 'SELESAI')
  const highest = severity
  const criticalActive = highest === 'CRITICAL'

  const routeCoords = useMemo(() => {
    const target: [number, number] = [-6.4821, 106.8287]
    const mid1: [number, number] = [(coordPos[0] + target[0]) / 2 + 0.01, (coordPos[1] + target[1]) / 2 - 0.01]
    const mid2: [number, number] = [(coordPos[0] + target[0]) / 2 - 0.01, (coordPos[1] + target[1]) / 2 + 0.01]
    return [coordPos, mid1, mid2, target] as [number, number][]
  }, [coordPos])

  const coordIcon = useMemo(() => {
    const html = `
      <div class="user-marker ${coordMode === 'EN_ROUTE' ? 'marker-enroute' : ''}" style="width:38px;height:38px;background:${
        coordMode === 'ARRIVED' ? '#22c55e' : '#3b82f6'
      }">DK</div>
    `
    return L.divIcon({ className: '', html, iconSize: [38, 38], iconAnchor: [19, 19] })
  }, [coordMode])

  return (
    <div className={layoutWrapCls} ref={fullWrapRef}>
      <AlertBorderEffect severity={severity} />
      <AlertBanner
        alert={bannerAlert}
        onClose={() => {
          setBannerAlert(null)
          setNewAlertId(null)
        }}
        onView={() => {
          const map = mapRef.current
          const a = bannerAlert
          if (!map || !a) return
          map.flyTo([a.lat, a.lng], 15, { animate: true, duration: 2 })
        }}
      />

      {recipientToast ? (
        <div className="fixed left-4 bottom-20 z-[150] w-[320px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl">
          <div className="text-sm font-semibold text-white">📱 Emergency Alert System</div>
          <div className="mt-1 text-sm text-slate-200">🔵 Coordinator sedang menuju lokasi darurat</div>
          <div className="mt-1 text-xs text-slate-400">Dewi Kusuma → Kebakaran Cibinong | ETA: ~8 menit</div>
        </div>
      ) : null}

      <div className={`transition-opacity duration-300 ${toolbarVis}`}>
        <div className={toolbarCls}>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setTileOpen((v) => !v)
                  setLayerOpen(false)
                  setSimOpen(false)
                  setCoordOpen(false)
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
                  setSimOpen(false)
                  setCoordOpen(false)
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
                    { k: 'batas', label: 'Batas Kabupaten', v: showBatas, on: () => setShowBatas((x) => !x) },
                    { k: 'heat', label: 'Heatmap', v: showHeatmap, on: () => setShowHeatmap((x) => !x) },
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
              onClick={() => {
                setSplit((v) => !v)
                window.setTimeout(() => mapRef.current?.invalidateSize(), 150)
                if (!split) {
                  const first = activeAlerts.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'CRITICAL' ? -1 : 1))[0]
                  if (first && mapRef.current) mapRef.current.flyTo([first.lat, first.lng], 14, { animate: true, duration: 1.5 })
                }
              }}
            >
              <PanelLeft className="h-4 w-4" />
              Split View
            </button>

            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setSimOpen((v) => !v)
                  setTileOpen(false)
                  setLayerOpen(false)
                  setCoordOpen(false)
                }}
              >
                <Siren className="h-4 w-4" />
                Simulasi
                <ChevronDown className="h-4 w-4" />
              </button>
              {simOpen ? (
                <div className="absolute left-0 top-11 z-[60] w-60 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                    onClick={() => {
                      setSimOpen(false)
                      void startSim('in')
                    }}
                  >
                    Alert dalam area (Bogor)
                  </button>
                  <button
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                    onClick={() => {
                      setSimOpen(false)
                      void startSim('out')
                    }}
                  >
                    Alert luar area (Kalimantan Barat)
                  </button>
                  <button
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-200 hover:bg-red-500/10"
                    onClick={() => {
                      setSimOpen(false)
                      stopDemo()
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <StopCircle className="h-4 w-4" /> Stop Demo
                    </span>
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => {
                  setCoordOpen((v) => !v)
                  setSimOpen(false)
                  setTileOpen(false)
                  setLayerOpen(false)
                }}
              >
                🔵 Sim: Coordinator
                <ChevronDown className="h-4 w-4" />
              </button>
              {coordOpen ? (
                <div className="absolute left-0 top-11 z-[60] w-56 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-2 shadow-xl">
                  <button
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                    onClick={() => {
                      setCoordOpen(false)
                      startCoordinator()
                    }}
                  >
                    Dewi ACC & Mulai Jalan
                  </button>
                  <button
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                    onClick={() => {
                      setCoordOpen(false)
                      arriveCoordinator()
                    }}
                  >
                    Simulasi TIBA di Lokasi
                  </button>
                  <button
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-200 hover:bg-red-500/10"
                    onClick={() => {
                      setCoordOpen(false)
                      resetCoordinator()
                    }}
                  >
                    Reset Simulasi
                  </button>
                </div>
              ) : null}
            </div>

            {isSuper ? (
              <button
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold ${
                  criticalActive ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
                onClick={() => {
                  if (criticalActive) {
                    pushToast({ type: 'alert', title: '🔴 PAKSA Broadcast', message: '🔴 PAKSA: 3 admin diarahkan ke lokasi CRITICAL', durationMs: 10000 })
                    return
                  }
                  setBroadcastOpen(true)
                }}
              >
                🎮 SA
              </button>
            ) : null}

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
              {activeAlerts
                .slice()
                .sort((a, b) => {
                  const rank = (s: Severity) => (s === 'CRITICAL' ? 0 : s === 'HIGH' ? 1 : s === 'MEDIUM' ? 2 : 3)
                  return rank(a.severity) - rank(b.severity)
                })
                .map((a) => (
                  <button
                    key={a.id}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
                    onClick={() => mapRef.current?.flyTo([a.lat, a.lng], 14, { animate: true, duration: 1.5 })}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white">[{a.typeIcon}] {a.typeLabel}</div>
                      <div
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.severity === 'CRITICAL'
                            ? 'bg-red-500 text-white'
                            : a.severity === 'HIGH'
                              ? 'bg-orange-500 text-white'
                              : 'bg-amber-400 text-black'
                        }`}
                      >
                        {a.severity}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-300">{a.location}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> {a.timeLabel}
                    </div>
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
              minZoom={4}
              maxZoom={18}
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
              <TileLayer url={tileLayers[tile].url} attribution={tileLayers[tile].attribution} />
              <MapEvents onMove={(p) => setCursor(p)} />

              {coordMode !== 'OFF' ? (
                <>
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{
                      color: coordMode === 'ARRIVED' ? '#22c55e' : '#3b82f6',
                      weight: 3,
                      dashArray: coordMode === 'ARRIVED' ? undefined : '8 6',
                    }}
                  >
                    <Tooltip sticky>{`Dewi — ETA ${Math.ceil(coordEtaSec / 60)} mnt`}</Tooltip>
                  </Polyline>
                  <Marker position={coordPos} icon={coordIcon}>
                    <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
                      {coordMode === 'ARRIVED' ? '🟢 Dewi — Sudah Tiba' : '🔵 Dewi — Menuju TKP'}
                    </Tooltip>
                  </Marker>
                </>
              ) : null}

              <MarkerClusters enabled={true} showUsers={showUsers} showAlerts={showAlerts} users={userMarkers} alerts={demoOn && bannerAlert ? [...alerts, bannerAlert] : alerts} newAlertId={newAlertId} />
              <HeatmapLayer enabled={showHeatmap} />
              <MiniMapControl />
            </MapContainer>
          </div>

          {showHeatmap ? (
            <div className="absolute bottom-14 left-4 z-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-slate-200">
              🔥 Heatmap: Data 30 hari terakhir — 20 insiden terpetakan
            </div>
          ) : null}

          {showBatas ? (
            <div className="absolute bottom-14 left-4 z-20 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-xs text-slate-200">
              Batas kabupaten (placeholder)
            </div>
          ) : null}

          {coordMode !== 'OFF' ? (
            <div className="absolute right-4 top-16 z-30 w-[360px] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-xl">
              <div className="text-sm font-semibold text-white">🔵 COORDINATOR AKTIF — MENUJU LOKASI</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-200">DK</div>
                <div>
                  <div className="text-sm font-semibold text-white">Dewi Kusuma</div>
                  <div className="text-xs text-slate-300">Menuju: 🔥 Kebakaran — Cibinong</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-200">
                <div>📍 Jarak ke TKP : 2.3 km</div>
                <div>⏱️ ETA : ~{Math.ceil(coordEtaSec / 60)} menit</div>
                <div>🚗 Kecepatan : {coordSpeed} km/h</div>
              </div>
              <div className="mt-4">
                <div className="text-xs text-slate-300">Progress perjalanan:</div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${coordProgress}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <div>Start</div>
                  <div>Sekarang</div>
                  <div>TKP</div>
                </div>
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
                onClick={() => mapRef.current?.flyTo(coordPos, 15, { animate: true, duration: 1.5 })}
              >
                Lacak di Peta
              </button>
              {coordMode === 'ARRIVED' ? (
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  🟢 Dewi Kusuma sudah tiba di lokasi!
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="h-[50px] border-t border-[var(--border)] bg-[var(--panel)] px-4">
        <div className="flex h-full items-center justify-between gap-3 text-sm text-slate-200">
          <div className="flex items-center gap-4">
            <div>🟢 {showUsers ? userMarkers.length : 0} User Online</div>
            <div>🚨 {showAlerts ? activeAlerts.length : 0} Alert Aktif</div>
            <div className="text-xs text-slate-400">{severitySummary(alerts)}</div>
          </div>
          <div className="text-xs text-slate-300">Koordinat: {cursor.lat.toFixed(3)}, {cursor.lng.toFixed(3)}</div>
          <div className="text-xs text-slate-300">Zoom: {cursor.zoom} | Update: {lastUpdate}</div>
        </div>
      </div>

      <OverlayModal open={broadcastOpen} title="📡 Konfirmasi Siaran Peta" onClose={() => setBroadcastOpen(false)} widthClassName="w-[560px]">
        <div className="space-y-4">
          <div className="text-sm text-slate-200">3 admin online akan diarahkan ke koordinat peta Anda saat ini.</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <div>Admin yang akan menerima:</div>
            <div className="mt-2 space-y-1 text-slate-300">
              <div>• Budi Santoso (Bogor)</div>
              <div>• Citra Dewi (Depok)</div>
              <div>• Dani Kurnia (Sentul)</div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15" onClick={() => setBroadcastOpen(false)}>
              Batal
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                setBroadcastOpen(false)
                pushToast({ type: 'success', title: 'Broadcast sukses', message: '✅ 3 admin berhasil diarahkan ke lokasi ini', durationMs: 5000 })
                setRecipientToast(true)
                window.setTimeout(() => setRecipientToast(false), 2000)
              }}
            >
              ✅ Ya, Arahkan Semua
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  )
}

