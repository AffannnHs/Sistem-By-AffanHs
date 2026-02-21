# 🐛 FIX — LIVE MAP + NAVBAR BUGS
## Perbaiki semua bug yang terdeteksi

---

## BUG 1 — DUPLIKAT TOMBOL FULLSCREEN DI DROPDOWN AVATAR

Di komponen Navbar atau dropdown avatar, ada 2 tombol "Fullscreen" muncul sekaligus. Hapus salah satunya.

Cari di file Navbar/Header component, bagian dropdown avatar:

```typescript
// ❌ HAPUS salah satu — jangan ada 2 item Fullscreen
// Dropdown avatar seharusnya HANYA berisi:
// - Profil
// - Logout

// ✅ BENAR — isi dropdown avatar:
const avatarMenuItems = [
  {
    label: 'Profil',
    icon: <User size={16} />,
    onClick: () => navigate('/dashboard/profile')
  },
  {
    label: 'Keluar',
    icon: <LogOut size={16} />,
    onClick: handleLogout,
    className: 'text-red-400 hover:text-red-300'
  }
]
```

Tombol Fullscreen yang benar tempatnya HANYA di toolbar Live Map, bukan di dropdown avatar navbar.

---

## BUG 2 — NOTIFIKASI KOSONG (Connect ke Supabase)

Buat hook `useNotifications` dan hubungkan ke dropdown notifikasi di Navbar.

### Buat `src/hooks/useNotifications.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useSessionStore } from '../store/sessionStore'

export interface Notification {
  id: string
  type: 'ALERT_NEW' | 'USER_PENDING' | 'ALERT_RESOLVED' | 'DEVICE_OFFLINE'
  title: string
  message: string
  read: boolean
  link: string
  created_at: string
}

export function useNotifications() {
  const { user } = useSessionStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const buildNotifications = useCallback(async () => {
    if (!user) return
    const items: Notification[] = []

    // 1. Alert aktif yang belum resolved
    const { data: activeAlerts } = await supabase
      .from('alerts')
      .select('id, type, created_at, triggered_by_user:users!alerts_triggered_by_fkey(name)')
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .limit(5)

    const typeLabel: Record<string, string> = {
      FIRE: '🔥 Kebakaran', MEDICAL: '🏥 Medis',
      CRIME: '🦹 Kriminal', DISASTER: '🌊 Bencana', HELP: '🆘 Bantuan'
    }

    activeAlerts?.forEach(alert => {
      items.push({
        id: `alert-${alert.id}`,
        type: 'ALERT_NEW',
        title: 'Alert Aktif',
        message: `${typeLabel[alert.type] || alert.type} dilaporkan`,
        read: false,
        link: `/dashboard/alerts/${alert.id}`,
        created_at: alert.created_at
      })
    })

    // 2. User pending (hanya untuk ADMIN & SUPER_ADMIN)
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING')

      if (count && count > 0) {
        items.push({
          id: 'pending-users',
          type: 'USER_PENDING',
          title: 'Pendaftar Baru',
          message: `${count} user menunggu persetujuan`,
          read: false,
          link: '/dashboard/users/pending',
          created_at: new Date().toISOString()
        })
      }
    }

    // 3. Device offline
    const { data: offlineDevices } = await supabase
      .from('iot_devices')
      .select('id, name')
      .eq('status', 'OFFLINE')
      .limit(3)

    offlineDevices?.forEach(device => {
      items.push({
        id: `device-${device.id}`,
        type: 'DEVICE_OFFLINE',
        title: 'Device Offline',
        message: `${device.name} tidak merespons`,
        read: false,
        link: '/dashboard/devices',
        created_at: new Date().toISOString()
      })
    })

    setNotifications(items)
    setUnreadCount(items.filter(n => !n.read).length)
  }, [user])

  useEffect(() => {
    buildNotifications()

    // Auto refresh setiap 30 detik
    const interval = setInterval(buildNotifications, 30000)

    // Realtime: saat ada alert baru
    const sub = supabase
      .channel('notif-alerts')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'alerts'
      }, buildNotifications)
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(sub)
    }
  }, [buildNotifications])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead, refetch: buildNotifications }
}
```

### Update komponen Navbar — bagian notifikasi:
```typescript
import { useNotifications } from '../hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

// Di dalam komponen Navbar:
const { notifications, unreadCount, markAllRead } = useNotifications()
const navigate = useNavigate()

// Icon notif di navbar — badge pakai unreadCount dari hook (bukan hardcoded)
// Dropdown notifikasi:

const notifIcon: Record<string, string> = {
  ALERT_NEW: '🚨',
  USER_PENDING: '👤',
  ALERT_RESOLVED: '✅',
  DEVICE_OFFLINE: '📡'
}

// Render dropdown:
{notifications.length === 0 ? (
  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
    <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
    <div>Tidak ada notifikasi</div>
    <div style={{ fontSize: 12, marginTop: 4 }}>Semua aman saat ini</div>
  </div>
) : (
  notifications.map(notif => (
    <div
      key={notif.id}
      onClick={() => { navigate(notif.link); markAllRead() }}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid #2e3248',
        background: notif.read ? 'transparent' : '#22253a',
        display: 'flex', gap: 12, alignItems: 'flex-start'
      }}
    >
      <span style={{ fontSize: 20 }}>{notifIcon[notif.type]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>
          {notif.title}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
          {notif.message}
        </div>
        <div style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>
          {formatDistanceToNow(new Date(notif.created_at), {
            addSuffix: true, locale: idLocale
          })}
        </div>
      </div>
      {!notif.read && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#ef4444', marginTop: 4, flexShrink: 0
        }} />
      )}
    </div>
  ))
)}
```

---

## BUG 3 — LIVE MAP: BATAS ZOOM + FIX TAMPILAN

Cari file Live Map / MapContainer, update konfigurasi Leaflet:

### Fix zoom bounds:
```typescript
// Di MapContainer atau useMap hook:
<MapContainer
  center={[-2.5, 118.0]}   // Center Indonesia
  zoom={5}                  // Default zoom: Indonesia full
  minZoom={5}               // ← MIN ZOOM: tidak bisa zoom out lebih dari Indonesia
  maxZoom={18}              // Max zoom in
  maxBounds={[             // ← Batas area peta (Asia Tenggara)
    [-12.0, 94.0],         // Sudut bawah kiri (selatan Jawa - barat Sumatra)
    [8.0, 142.0]           // Sudut kanan atas (utara - Papua timur)
  ]}
  maxBoundsViscosity={1.0} // Tidak bisa keluar dari bounds sama sekali
  style={{ height: '100%', width: '100%' }}
>
```

### Tambahkan handler saat zoom keluar terlalu jauh:
```typescript
// Buat komponen MapController di dalam MapContainer:
function MapController() {
  const map = useMap()

  useEffect(() => {
    // Paksa kembali ke Indonesia jika zoom terlalu jauh
    map.on('zoomend', () => {
      if (map.getZoom() < 5) {
        map.setView([-2.5, 118.0], 5, { animate: true })
      }
    })

    // Fit bounds Indonesia saat pertama load
    map.fitBounds([
      [-11.0, 95.0],  // SW Indonesia
      [6.0, 141.5]    // NE Indonesia
    ])
  }, [map])

  return null
}

// Taruh di dalam <MapContainer>:
// <MapController />
```

### Fix tile layer agar tidak blank saat zoom out:
```typescript
// Pastikan tile layer ada attribution dan crossOrigin:
<TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  attribution="Tiles © Esri"
  minZoom={3}
  maxZoom={18}
  tileSize={256}
  keepBuffer={4}        // ← cache lebih banyak tile
  updateWhenIdle={false}
  updateWhenZooming={false}
/>
```

---

## BUG 4 — LIVE MAP: HAPUS SEMUA TOMBOL SIMULASI/DEMO

Cari dan hapus dari file LiveMap.tsx:
- Tombol `[🔴 Simulasi Alert]`
- Tombol `[🔵 Sim: Coordinator]`
- Tombol `[⏹ Stop Demo]`
- Semua `const demoCoords`, `const mockAlerts`, array mock data
- Semua `setInterval` untuk simulasi pergerakan marker

Ganti dengan data real dari hooks yang sudah dibuat sebelumnya:
```typescript
import { useAlerts, useUsers } from '../hooks/useSupabase'

const { alerts } = useAlerts('ACTIVE')       // Alert real dari Supabase
const { users } = useUsers()                  // User real dari Supabase
const usersWithLocation = users.filter(u => u.last_lat && u.last_lng)
```

---

## BUG 5 — STATUS BAR BAWAH MAP: DATA REAL

```typescript
// Status bar bawah peta — pakai data real:
const onlineCount = users.filter(u => u.status === 'ACTIVE').length
const activeAlertCount = alerts.length

// Render:
// 🟢 {onlineCount} User Online | 🚨 {activeAlertCount} Alert Aktif
```

---

## HASIL YANG DIHARAPKAN

- ✅ Dropdown avatar: hanya ada Profil + Keluar (tidak ada duplikat Fullscreen)
- ✅ Dropdown notifikasi: menampilkan alert aktif + user pending + device offline
- ✅ Badge notifikasi: angka real dari database
- ✅ Peta tidak bisa zoom out lebih dari tampilan Indonesia penuh
- ✅ Peta tidak bisa geser keluar wilayah Indonesia/Asia Tenggara
- ✅ Tidak ada tombol demo/simulasi di Live Map
- ✅ Marker peta dari data Supabase real
