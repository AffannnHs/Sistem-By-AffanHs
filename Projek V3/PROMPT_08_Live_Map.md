# 🤖 TRAE PROMPT #8 — LIVE MAP (LEAFLET.JS + SEMUA LAYER)
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#7 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/live-map` dengan peta Leaflet.js interaktif.

## INSTALL DEPENDENCIES DULU
```bash
npm install leaflet react-leaflet @types/leaflet
```

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────────────┐
│ TOOLBAR ATAS (bg #1a1d27, padding 12px)                 │
│ [🛰️ Satelit ▼]  [Layer ▼]  [⊞ Split View]  [⛶ Fullscr]│
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              PETA LEAFLET                               │
│         (height: calc(100vh - 60px - 60px - 50px))      │
│                                                         │
│  (marker alert + marker user + polygon kabupaten)       │
│                                              ┌────────┐ │
│                                              │MINIMAP │ │
│                                              └────────┘ │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ STATUS BAR (bg #1a1d27, border atas)                    │
│ 🟢 8 Online  │  🚨 3 Alert  │  Koordinat  │  Zoom: 12  │
└─────────────────────────────────────────────────────────┘
```

## PENTING: FIX SSR ISSUE LEAFLET
Gunakan dynamic import untuk semua komponen Leaflet:
```typescript
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
// atau buat wrapper komponen dengan dynamic import
```

## KONFIGURASI PETA
```javascript
center: [-2.5, 118.0]  // Indonesia
zoom: 5
minZoom: 4
maxZoom: 18
```

## TILE LAYERS (4 style, bisa switch)

```javascript
const tileLayers = {
  satellite: {
    label: '🛰️ Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri'
  },
  normal: {
    label: '🗺️ Normal',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  dark: {
    label: '🌑 Gelap',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB'
  },
  terrain: {
    label: '🏔️ Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap'
  }
}
// Default: satellite
```

## MOCK DATA

### Alert Markers:
```javascript
const alertMarkers = [
  { id: 1, type: 'FIRE', severity: 'CRITICAL', 
    lat: -6.4821, lng: 106.8287,
    location: 'Cibinong, Kab. Bogor', reporter: 'Budi Santoso', time: '8 mnt lalu' },
  { id: 2, type: 'MEDICAL', severity: 'HIGH',
    lat: -6.5521, lng: 106.9187,
    location: 'Sentul, Kab. Bogor', reporter: 'Hana Pertiwi', time: '22 mnt lalu' },
  { id: 3, type: 'HELP', severity: 'MEDIUM',
    lat: -6.4021, lng: 106.7987,
    location: 'Depok', reporter: 'Irfan Maulana', time: '35 mnt lalu' },
]
```

### User Markers:
```javascript
const userMarkers = [
  { id: 1, name: 'Dewi Kusuma', role: 'COORDINATOR',
    lat: -6.5021, lng: 106.8487, status: 'EN_ROUTE', alertId: 1 },
  { id: 2, name: 'Eko Prasetyo', role: 'COORDINATOR',
    lat: -6.3821, lng: 106.8187, status: 'ONLINE' },
  { id: 3, name: 'Gunawan Wijaya', role: 'MEMBER',
    lat: -6.4621, lng: 106.8887, status: 'ONLINE' },
  { id: 4, name: 'Hana Pertiwi', role: 'MEMBER',
    lat: -6.5221, lng: 106.9087, status: 'ONLINE' },
]
```

## CUSTOM MARKER ALERT (DivIcon)

```javascript
// Warna per jenis darurat:
// FIRE     → merah   #ef4444
// MEDICAL  → hijau   #22c55e
// CRIME    → ungu    #a855f7
// DISASTER → biru    #3b82f6
// HELP     → kuning  #eab308

// Ikon di dalam marker (teks emoji atau SVG kecil):
// FIRE → 🔥 | MEDICAL → ➕ | CRIME → ⚠️ | DISASTER → 🌊 | HELP → 🆘

// CRITICAL: tambahkan CSS pulse ring animation
// Contoh HTML DivIcon:
`<div class="alert-marker fire critical">
  <span class="marker-icon">🔥</span>
  <div class="pulse-ring"></div>
</div>`
```

CSS pulse ring:
```css
.pulse-ring {
  position: absolute;
  border: 3px solid #ef4444;
  border-radius: 50%;
  animation: pulse-expand 1.5s infinite;
}
@keyframes pulse-expand {
  0% { width: 100%; height: 100%; opacity: 1; }
  100% { width: 200%; height: 200%; opacity: 0; transform: translate(-25%, -25%); }
}
```

## CUSTOM MARKER USER (DivIcon)

```javascript
// COORDINATOR: lingkaran biru #3b82f6, lebih besar (36px), border 2px putih
// MEMBER:      lingkaran hijau #22c55e, lebih kecil (28px)
// EN_ROUTE:    tambah ripple animation biru

// Inisial nama di dalam lingkaran (2 huruf pertama)
// Contoh: "DK" untuk Dewi Kusuma
```

## POPUP ALERT (klik marker alert)
```
┌─────────────────────────────────────┐
│ 🔥 KEBAKARAN — CRITICAL             │
│ ─────────────────────────────────   │
│ 📍 Cibinong, Kab. Bogor            │
│ 👤 Budi Santoso — 8 mnt lalu       │
│ ─────────────────────────────────   │
│ [Assign] [💬 Chat] [✅ Resolve]     │
└─────────────────────────────────────┘
```
Style popup: bg #1a1d27, border #2e3248, teks putih (override default Leaflet popup CSS)

## POPUP USER (klik marker user)
```
┌─────────────────────────────────────┐
│ 🔵 Dewi Kusuma — COORDINATOR        │
│ 🟡 Sedang Menuju Lokasi             │
│ Grup: Grup Bogor                    │
│ GPS update: 45 detik lalu           │
│ ─────────────────────────────────   │
│ [Kirim Alert ke User Ini]           │
└─────────────────────────────────────┘
```

## LAYER CONTROL (dropdown toolbar)
Toggle layer on/off:
- ✅ User Online
- ✅ Alert Aktif
- ☐ Batas Kabupaten (akan diisi Prompt #10)
- ☐ Heatmap (akan diisi Prompt #10)

## MAP STYLE SWITCHER
Dropdown di toolbar kiri: "[🛰️ Satelit ▼]"
Pilih style → tile layer langsung berubah

## STATUS BAR BAWAH
Fixed bar bg #1a1d27, border atas #2e3248, padding 8px 16px:

Kiri: `🟢 8 User Online` | `🚨 3 Alert Aktif`
Tengah: koordinat lat/lng saat mouse hover di peta (update real-time)
Kanan: `Zoom: 12` | waktu `Update: 14:35 WIB`

Override default Leaflet CSS agar cocok dengan dark theme.

## CATATAN
- Semua komponen Leaflet: dynamic import (fix SSR Next.js)
- Fix leaflet default icon issue: import L from 'leaflet' dan set iconUrl manual
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #9
- [ ] Peta Leaflet tampil tanpa error
- [ ] Default view: Indonesia penuh zoom 5
- [ ] Default tile: Satelit (ESRI)
- [ ] Switch style Normal/Dark/Terrain berfungsi
- [ ] 3 marker alert tampil di posisi Bogor/Depok
- [ ] 4 marker user tampil
- [ ] Custom DivIcon marker (warna per jenis/role)
- [ ] Pulse ring di marker CRITICAL
- [ ] Popup alert muncul saat klik marker alert
- [ ] Popup user muncul saat klik marker user
- [ ] Status bar bawah tampil dengan data
- [ ] Koordinat update saat hover peta
