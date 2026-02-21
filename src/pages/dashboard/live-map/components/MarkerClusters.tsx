import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'

export type MapAlert = {
  id: string
  type: string
  severity: string
  status: string
  lat: number
  lng: number
  location?: string | null
  address?: string | null
  reporter_name?: string | null
  created_at?: string | null
}

export type UserMarker = {
  id: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER'
  lat: number
  lng: number
  last_seen_at?: string | null
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase()
}

function alertColor(a: MapAlert) {
  if (a.type === 'FIRE') return '#ef4444'
  if (a.type === 'MEDICAL') return '#22c55e'
  if (a.type === 'CRIME') return '#a855f7'
  if (a.type === 'DISASTER') return '#3b82f6'
  return '#eab308'
}

function alertEmoji(type: string) {
  if (type === 'FIRE') return '🔥'
  if (type === 'MEDICAL') return '➕'
  if (type === 'CRIME') return '🦹'
  if (type === 'DISASTER') return '🌊'
  return '🆘'
}

function fromNowLabel(iso: string | null | undefined) {
  if (!iso) return ''
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

function alertIcon(a: MapAlert, isNew: boolean) {
  const cls = `alert-marker ${String(a.type).toLowerCase()} ${a.severity === 'CRITICAL' ? 'critical' : ''} ${isNew ? 'marker-new' : ''}`
  const bg = alertColor(a)
  const html = `
    <div class="${cls}" style="background:${bg}">
      <span class="marker-icon">${alertEmoji(a.type)}</span>
      ${a.severity === 'CRITICAL' ? '<div class="pulse-ring"></div>' : ''}
    </div>
  `
  return L.divIcon({ className: '', html, iconSize: [34, 34], iconAnchor: [17, 17] })
}

function userIcon(u: UserMarker) {
  const size = u.role === 'COORDINATOR' ? 36 : u.role === 'SUPER_ADMIN' ? 36 : 28
  const bg = u.role === 'COORDINATOR' ? '#3b82f6' : u.role === 'SUPER_ADMIN' ? '#ef4444' : '#22c55e'
  const cls = 'user-marker'
  const html = `<div class="${cls}" style="width:${size}px;height:${size}px;background:${bg}">${initials(u.name)}</div>`
  return L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

function userClusterIcon(count: number) {
  const cls = count < 10 ? 'cluster-small' : count <= 50 ? 'cluster-medium' : 'cluster-large'
  const html = `<div class="cluster-icon ${cls}">${count}</div>`
  return L.divIcon({ className: '', html, iconSize: [36, 36] })
}

function alertClusterIcon(count: number) {
  const html = `<div class="cluster-icon cluster-large">${count}</div>`
  return L.divIcon({ className: '', html, iconSize: [36, 36] })
}

export default function MarkerClusters({
  enabled,
  showUsers,
  showAlerts,
  users,
  alerts,
  newAlertId,
}: {
  enabled: boolean
  showUsers: boolean
  showAlerts: boolean
  users: UserMarker[]
  alerts: MapAlert[]
  newAlertId: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (!enabled) return
    type Cluster = { getChildCount: () => number }
    type MarkerClusterGroup = L.LayerGroup & { addLayer: (layer: L.Layer) => void }
    type MarkerClusterGroupFactory = (opts: {
      showCoverageOnHover: boolean
      spiderfyOnMaxZoom: boolean
      maxClusterRadius: number
      iconCreateFunction: (cluster: Cluster) => L.DivIcon
    }) => MarkerClusterGroup

    const factory = (L as unknown as { markerClusterGroup?: MarkerClusterGroupFactory }).markerClusterGroup

    const createGroup: MarkerClusterGroupFactory =
      typeof factory === 'function'
        ? factory
        : (() => L.layerGroup() as unknown as MarkerClusterGroup)

    const groupUsers = createGroup({
      showCoverageOnHover: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => userClusterIcon(cluster.getChildCount()),
    })
    const groupAlerts = createGroup({
      showCoverageOnHover: true,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 60,
      iconCreateFunction: (cluster) => alertClusterIcon(cluster.getChildCount()),
    })

    if (showUsers) {
      users.forEach((u) => {
        const m = L.marker([u.lat, u.lng], { icon: userIcon(u) })
        m.bindPopup(
          `<div><div style="font-weight:700">👤 ${u.name} — ${u.role}</div><div style="margin-top:6px">🟢 Online</div><div style="margin-top:6px">GPS update: ${fromNowLabel(
            u.last_seen_at,
          )}</div></div>`,
        )
        groupUsers.addLayer(m)
      })
      groupUsers.addTo(map)
    }

    if (showAlerts) {
      alerts.forEach((a) => {
        const m = L.marker([a.lat, a.lng], { icon: alertIcon(a, newAlertId === a.id) })
        m.bindPopup(
          `<div><div style="font-weight:700">${alertEmoji(a.type)} ${a.type} — ${a.severity}</div><div style="margin-top:6px">📍 ${a.location ?? '-'}</div><div style="margin-top:6px">👤 ${
            a.reporter_name ?? '-'
          } — ${fromNowLabel(a.created_at)}</div></div>`,
        )
        groupAlerts.addLayer(m)
      })
      groupAlerts.addTo(map)
    }

    return () => {
      map.removeLayer(groupUsers)
      map.removeLayer(groupAlerts)
    }
  }, [alerts, enabled, map, newAlertId, showAlerts, showUsers, users])

  return null
}

