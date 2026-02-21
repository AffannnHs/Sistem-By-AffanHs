import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSessionStore } from '@/stores/sessionStore'
import { supabase } from '@/utils/supabase'

export type NotificationType = 'ALERT_NEW' | 'USER_PENDING' | 'ALERT_RESOLVED' | 'DEVICE_OFFLINE'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  link: string
  created_at: string
}

function uniqById(items: Notification[]) {
  const seen = new Set<string>()
  const out: Notification[] = []
  for (const it of items) {
    if (seen.has(it.id)) continue
    seen.add(it.id)
    out.push(it)
  }
  return out
}

export function useNotifications() {
  const user = useSessionStore((s) => s.user)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const buildNotifications = useCallback(async () => {
    if (!supabase || !user) {
      setNotifications([])
      return
    }

    const items: Notification[] = []

    const [{ data: activeAlerts }, { count: pendingUsersCount }, { data: offlineDevices }] = await Promise.all([
      supabase
        .from('alerts')
        .select('id, type, created_at, status')
        .in('status', ['ACTIVE', 'AKTIF'])
        .order('created_at', { ascending: false })
        .limit(5),
      user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
        ? supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', 'PENDING')
        : Promise.resolve({ count: 0 } as unknown as { count: number | null }),
      supabase.from('iot_devices').select('id, name, status').eq('status', 'OFFLINE').limit(3),
    ])

    ;(activeAlerts ?? []).forEach((a) => {
      items.push({
        id: `alert-${a.id}`,
        type: 'ALERT_NEW',
        title: 'Alert Aktif',
        message: `Ada alert baru (${a.type ?? 'UNKNOWN'})`,
        read: false,
        link: `/dashboard/alerts/${a.id}`,
        created_at: a.created_at ?? new Date().toISOString(),
      })
    })

    if ((user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') && (pendingUsersCount ?? 0) > 0) {
      items.push({
        id: 'pending-users',
        type: 'USER_PENDING',
        title: 'Pendaftar Baru',
        message: `${pendingUsersCount} user menunggu persetujuan`,
        read: false,
        link: '/dashboard/users/pending',
        created_at: new Date().toISOString(),
      })
    }

    ;(offlineDevices ?? []).forEach((d) => {
      items.push({
        id: `device-${d.id}`,
        type: 'DEVICE_OFFLINE',
        title: 'Device Offline',
        message: `${d.name ?? 'Device'} tidak merespons`,
        read: false,
        link: '/dashboard/devices',
        created_at: new Date().toISOString(),
      })
    })

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setNotifications((prev) => {
      const prevRead = new Map(prev.map((x) => [x.id, x.read]))
      return uniqById(items).map((x) => ({ ...x, read: prevRead.get(x.id) ?? x.read }))
    })
  }, [user])

  useEffect(() => {
    void buildNotifications()
  }, [buildNotifications])

  useEffect(() => {
    if (!supabase || !user) return
    const interval = window.setInterval(() => void buildNotifications(), 30000)

    const sub = supabase
      .channel('notif-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => void buildNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => void buildNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'iot_devices' }, () => void buildNotifications())
      .subscribe()

    return () => {
      window.clearInterval(interval)
      supabase.removeChannel(sub)
    }
  }, [buildNotifications, user])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  return { notifications, unreadCount, markAllRead, refetch: buildNotifications }
}

