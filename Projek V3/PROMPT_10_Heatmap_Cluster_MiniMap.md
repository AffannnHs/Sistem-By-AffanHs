# 🤖 TRAE PROMPT #10 — HEATMAP + CLUSTER + MINIMAP + SPLIT PANEL
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#9 sudah selesai ✅

---

Lanjutkan project. Tambahkan 4 fitur lanjutan ke halaman Live Map.

## INSTALL DEPENDENCIES DULU
```bash
npm install leaflet.heat leaflet.markercluster
npm install @types/leaflet.markercluster
```

## 1. HEATMAP LAYER

Buat `HeatmapLayer.tsx` (dynamic import, no SSR):

Mock data 20 titik di Jawa Barat:
```javascript
const heatmapData: [number, number, number][] = [
  [-6.4821, 106.8287, 0.9],  // Cibinong - sangat tinggi
  [-6.5521, 106.9187, 0.7],  // Sentul - tinggi
  [-6.4021, 106.7987, 0.6],  // Depok Barat
  [-6.2088, 106.8456, 0.8],  // Jakarta Selatan
  [-6.3621, 106.8287, 0.5],  // Depok Tengah
  [-6.4921, 106.8587, 0.7],  // Cibinong Utara
  [-6.5121, 106.8887, 0.4],  // Babakanmadang
  [-6.9175, 107.6191, 0.6],  // Bandung
  [-6.8721, 107.5791, 0.4],  // Bandung Barat
  [-7.0051, 107.6691, 0.3],  // Bandung Selatan
  [-6.4321, 106.7587, 0.5],  // Sawangan
  [-6.3821, 106.7987, 0.4],  // Cinere
  [-6.4621, 106.8087, 0.6],  // Limo
  [-6.5321, 106.8487, 0.5],  // Bojong Gede
  [-6.5821, 106.9587, 0.3],  // Cariu
  [-6.6221, 106.7987, 0.4],  // Leuwiliang
  [-6.4821, 107.0287, 0.3],  // Jonggol
  [-6.3221, 107.1487, 0.2],  // Karawang
  [-6.2521, 106.9887, 0.4],  // Bekasi Barat
  [-6.2121, 107.0487, 0.5],  // Bekasi Timur
]
```

Konfigurasi:
```javascript
// radius: 25, blur: 15, maxZoom: 17
// gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
```

Toggle dari Layer Control dropdown (aktifkan/nonaktifkan)
Saat heatmap aktif, tampilkan info kecil di bawah peta:
"🔥 Heatmap: Data 30 hari terakhir — 20 insiden terpetakan"

## 2. MARKER CLUSTERING

Buat `ClusteredUserMarkers.tsx` dan `ClusteredAlertMarkers.tsx`:

Konfigurasi cluster:
```javascript
// showCoverageOnHover: true
// spiderfyOnMaxZoom: true (spider view saat zoom max)
// maxClusterRadius: 60
// iconCreateFunction: custom cluster icon

// Cluster user: hijau jika < 10, kuning jika 10-50, merah jika > 50
// Cluster alert: selalu merah (darurat)

// Custom cluster icon (DivIcon):
`<div class="cluster-icon cluster-small">5</div>`

// CSS cluster:
.cluster-small  { background: #22c55e; } /* hijau */
.cluster-medium { background: #eab308; } /* kuning */
.cluster-large  { background: #ef4444; } /* merah */
// Semua: border-radius 50%, teks putih bold, 36px x 36px
```

Klik cluster → zoom in + expand marker
Spider mode saat zoom max

## 3. MINI MAP (pojok kanan bawah)

Install: `npm install leaflet-minimap`

Buat `MiniMapControl.tsx`:
- Muncul otomatis saat zoom level > 10 (useEffect cek zoom level)
- Sembunyikan saat zoom < 10
- Ukuran: 150px × 120px
- Posisi: pojok kanan bawah peta, margin 16px
- Tile: Normal OpenStreetMap (selalu, tidak ikut switch style utama)
- Rectangle merah = area viewport peta utama
- Tombol minimize (toggle):
  ```
  [−] ← klik untuk sembunyikan
  ```
- Peta mini tidak interaktif (toggleDisplay: true, minimized state)

## 4. ALERT SPLIT PANEL

Tambahkan tombol [⊞ Split View] di toolbar (toggle).

Saat Split View aktif, layout berubah jadi:
```
┌──────────────────────────┬────────────────────────────────┐
│  PANEL KIRI (30% width)  │                                │
│  bg #1a1d27              │     PETA (70% width)           │
│                          │                                │
│  Header: 🚨 Alert Aktif  │                                │
│  ─ CRITICAL ─────────    │                                │
│  [🔥] Kebakaran          │                                │
│       Cibinong           │                                │
│       8 mnt lalu ●       │                                │
│  ─ HIGH ─────────────    │                                │
│  [🏥] Medis              │                                │
│       Sentul             │                                │
│       22 mnt lalu ●      │                                │
│  ─ MEDIUM ───────────    │                                │
│  [🆘] Bantuan            │                                │
│       Depok              │                                │
│       35 mnt lalu        │                                │
└──────────────────────────┴────────────────────────────────┘
```

Perilaku Split Panel:
- List diurutkan: CRITICAL dulu → HIGH → MEDIUM → LOW
- Header group per severity dengan badge jumlah
- Item yang aktif/dipilih: bg highlight merah gelap + left border 3px merah
- Alert CRITICAL: auto-dipilih pertama kali saat split view dibuka
- Peta langsung flyTo ke alert pertama (CRITICAL) saat split terbuka
- Klik item list → peta flyTo ke lokasi alert (animasi 1.5 detik smooth)
- Ganti item → animasi flyTo ke lokasi baru
- Zoom saat flyTo dari split panel: zoom 14

Item list minimal:
```
┌────────────────────────┐
│ [🔥] [CRITICAL]        │  ← badge severity
│ Kebakaran              │
│ Cibinong, Kab. Bogor   │
│ ● 8 mnt lalu           │  ← dot pulse jika aktif
└────────────────────────┘
```

Saat Split View nonaktif: kembali ke layout peta penuh.

## UPDATE LAYER CONTROL

Update dropdown Layer Control dengan semua opsi:
```
✅ User Online          (default: aktif)
✅ Alert Aktif          (default: aktif)
☐  Batas Kabupaten      (default: nonaktif)
☐  Heatmap              (default: nonaktif)
```

Toggle setiap layer independen.

## CATATAN
- Semua leaflet plugin: dynamic import + no SSR
- Fix TypeScript types untuk leaflet.heat dan markercluster
- Teks Bahasa Indonesia

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #11
- [ ] Heatmap layer tampil saat diaktifkan (gradient merah-kuning-hijau-biru)
- [ ] Heatmap bisa di-toggle
- [ ] Marker user ter-cluster saat banyak berdekatan
- [ ] Cluster warna: hijau/kuning/merah sesuai jumlah
- [ ] Klik cluster → expand
- [ ] Mini-map pojok kanan bawah
- [ ] Mini-map muncul saat zoom > 10
- [ ] Rectangle viewport di mini-map
- [ ] Split panel toggle berfungsi
- [ ] List alert diurutkan CRITICAL dulu
- [ ] Klik item list → peta flyTo ke lokasi
- [ ] Item aktif di-highlight
