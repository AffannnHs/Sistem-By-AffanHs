export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type AlertStatus = 'AKTIF' | 'ESKALASI' | 'SELESAI'

export type AlertType = 'FIRE' | 'MEDICAL' | 'CRIME' | 'DISASTER' | 'HELP'

export type Alert = {
  id: string
  type: AlertType
  typeLabel: string
  typeIcon: string
  severity: Severity
  status: AlertStatus
  address: string
  location: string
  reporter: string
  trigger: string
  timeLabel: string
  lat: number
  lng: number
  escalationLevel: 1 | 2 | 3
  escalationCountdownSec?: number
  responder: { notified: number; ack: number; enRoute: number }
  description?: string
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER'

export type UserRow = {
  id: string
  name: string
  email: string
  role: UserRole
  group: string
  status: 'ONLINE' | 'DALAM_TUGAS' | 'OFFLINE' | 'SUSPENDED'
  lastSeen: string
  phone?: string
  lastLocation?: string
}

export type PendingUser = {
  id: string
  name: string
  email: string
  phone: string
  location: string
  timeLabel: string
}

export type DeviceType = 'ALARM' | 'BUTTON' | 'SENSOR'

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING'

export type Device = {
  id: string
  name: string
  type: DeviceType
  group: string
  location: string
  status: DeviceStatus
  signal: number
  lastPing: string
  lastTriggered: string
  triggersToday: number
  mqttTopic: string
}

