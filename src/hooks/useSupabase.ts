import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/utils/supabase'

export type DbUserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'MEMBER'
export type DbUserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'

export type DbUser = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: DbUserRole | null
  status: DbUserStatus | null
  group_name: string | null
  last_lat: number | null
  last_lng: number | null
  last_seen_at: string | null
}

export type DbAlertStatus = 'ACTIVE' | 'RESOLVED'
export type DbAlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type DbAlertType = 'FIRE' | 'MEDICAL' | 'CRIME' | 'DISASTER' | 'HELP'

export type DbAlert = {
  id: string
  type: DbAlertType
  severity: DbAlertSeverity
  status: DbAlertStatus
  address: string | null
  location: string | null
  description: string | null
  lat: number
  lng: number
  reporter_name: string | null
  trigger_source: string | null
  triggered_by: string | null
  created_at: string
  resolved_at: string | null
}

export type DbDeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING'
export type DbDeviceType = 'ALARM' | 'BUTTON' | 'SENSOR'

export type DbDevice = {
  id: string
  name: string
  type: DbDeviceType
  group_name: string | null
  latitude: number | null
  longitude: number | null
  mqtt_topic: string | null
  status: DbDeviceStatus
  signal: number | null
  last_ping_at: string | null
  last_triggered_at: string | null
  triggers_today: number
  created_at: string
  updated_at: string
}

export type DbMapSettings = {
  user_id: string
  preset_area: string | null
  map_style: string | null
  updated_at: string
}

export type DbChatMessage = {
  id: string
  alert_id: string
  sender_id: string
  message: string
  sent_at: string
}

type AnyFn = (...args: unknown[]) => unknown

function useStableCallback<T extends AnyFn>(fn: T) {
  const ref = useRef(fn)
  ref.current = fn
  return useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, [])
}

export function useUsers(params?: { status?: DbUserStatus; onlyWithLocation?: boolean }) {
  const [users, setUsers] = useState<DbUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useStableCallback(async () => {
    setLoading(true)
    setError(null)

    let q = supabase
      .from('users')
      .select('id, name, email, phone, role, status, group_name, last_lat, last_lng, last_seen_at')
      .order('created_at', { ascending: false })

    if (params?.status) q = q.eq('status', params.status)
    if (params?.onlyWithLocation) q = q.not('last_lat', 'is', null).not('last_lng', 'is', null)

    const { data, error: e } = await q
    if (e) {
      setError(e.message)
      setUsers([])
      setLoading(false)
      return
    }
    setUsers((data ?? []) as DbUser[])
    setLoading(false)
  })

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}

export function useAlerts(params?: { status?: DbAlertStatus; limit?: number; sinceIso?: string }) {
  const [alerts, setAlerts] = useState<DbAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = useStableCallback(async () => {
    setLoading(true)
    setError(null)

    let q = supabase
      .from('alerts')
      .select('id, type, severity, status, address, location, description, lat, lng, reporter_name, trigger_source, triggered_by, created_at, resolved_at')
      .order('created_at', { ascending: false })

    if (params?.status) q = q.eq('status', params.status)
    if (params?.sinceIso) q = q.gte('created_at', params.sinceIso)
    if (params?.limit) q = q.limit(params.limit)

    const { data, error: e } = await q
    if (e) {
      setError(e.message)
      setAlerts([])
      setLoading(false)
      return
    }
    setAlerts((data ?? []) as DbAlert[])
    setLoading(false)
  })

  useEffect(() => {
    void fetchAlerts()
  }, [fetchAlerts])

  useEffect(() => {
    const channelName = `alerts-changes-${params?.status ?? 'ALL'}-${params?.sinceIso ?? 'NONE'}-${params?.limit ?? 'NL'}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        void fetchAlerts()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchAlerts, params?.limit, params?.sinceIso, params?.status])

  return { alerts, loading, error, refetch: fetchAlerts }
}

export function useAlertById(id: string | undefined) {
  const [alert, setAlert] = useState<DbAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOne = useStableCallback(async () => {
    if (!id) {
      setAlert(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('alerts')
      .select('id, type, severity, status, address, location, description, lat, lng, reporter_name, trigger_source, triggered_by, created_at, resolved_at')
      .eq('id', id)
      .maybeSingle()

    if (e) {
      setError(e.message)
      setAlert(null)
      setLoading(false)
      return
    }
    setAlert((data ?? null) as DbAlert | null)
    setLoading(false)
  })

  useEffect(() => {
    void fetchOne()
  }, [fetchOne])

  return { alert, loading, error, refetch: fetchOne }
}

export function useChat(alertId: string | undefined) {
  const [messages, setMessages] = useState<DbChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useStableCallback(async () => {
    if (!alertId) {
      setMessages([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('chat_messages')
      .select('id, alert_id, sender_id, message, sent_at')
      .eq('alert_id', alertId)
      .order('sent_at', { ascending: true })
    if (e) {
      setError(e.message)
      setMessages([])
      setLoading(false)
      return
    }
    setMessages((data ?? []) as DbChatMessage[])
    setLoading(false)
  })

  useEffect(() => {
    void fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!alertId) return
    const channel = supabase
      .channel(`chat-${alertId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `alert_id=eq.${alertId}` }, () => {
        void fetchMessages()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [alertId, fetchMessages])

  const sendMessage = useCallback(async (senderId: string, message: string) => {
    if (!alertId) return
    const text = message.trim()
    if (!text) return
    await supabase.from('chat_messages').insert({ alert_id: alertId, sender_id: senderId, message: text })
  }, [alertId])

  return { messages, loading, error, refetch: fetchMessages, sendMessage }
}

export function useDevices() {
  const [devices, setDevices] = useState<DbDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevices = useStableCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('iot_devices')
      .select('id, name, type, group_name, latitude, longitude, mqtt_topic, status, signal, last_ping_at, last_triggered_at, triggers_today, created_at, updated_at')
      .order('created_at', { ascending: false })
    if (e) {
      setError(e.message)
      setDevices([])
      setLoading(false)
      return
    }
    setDevices((data ?? []) as DbDevice[])
    setLoading(false)
  })

  useEffect(() => {
    void fetchDevices()
  }, [fetchDevices])

  useEffect(() => {
    const channel = supabase
      .channel('iot-devices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'iot_devices' }, () => {
        void fetchDevices()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchDevices])

  return { devices, loading, error, refetch: fetchDevices }
}

export function useMapSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<DbMapSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useStableCallback(async () => {
    if (!userId) {
      setSettings(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('map_settings')
      .select('user_id, preset_area, map_style, updated_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (e) {
      setError(e.message)
      setSettings(null)
      setLoading(false)
      return
    }

    setSettings((data ?? null) as DbMapSettings | null)
    setLoading(false)
  })

  useEffect(() => {
    void fetchSettings()
  }, [fetchSettings])

  const upsert = useCallback(async (next: { preset_area: string | null; map_style: string | null }) => {
    if (!userId) return
    await supabase
      .from('map_settings')
      .upsert({ user_id: userId, preset_area: next.preset_area, map_style: next.map_style, updated_at: new Date().toISOString() })
  }, [userId])

  const hydrated = useMemo(() => {
    if (settings) return settings
    if (!userId) return null
    return { user_id: userId, preset_area: 'indonesia', map_style: 'SATELLITE', updated_at: new Date().toISOString() } as DbMapSettings
  }, [settings, userId])

  return { settings: hydrated, loading, error, refetch: fetchSettings, upsert }
}
