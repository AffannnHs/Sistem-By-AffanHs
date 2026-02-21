# 🤖 TRAE PROMPT #14 — COORDINATOR TRACKING + ROUTE LINE
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#13 sudah selesai ✅

---

Lanjutkan project. Tambahkan fitur tracking coordinator real-time di Live Map.

## 1. COORDINATOR TRACKER PANEL

Saat ada coordinator berstatus EN_ROUTE, tampilkan panel floating di Live Map.

Panel: pojok kanan atas peta (di bawah toolbar), bg #1a1d27, border #2e3248, rounded-lg:
```
┌────────────────────────────────────────────┐
│ 🔵 COORDINATOR AKTIF — MENUJU LOKASI       │
│ ──────────────────────────────────────     │
│ [DK]  Dewi Kusuma                          │
│       Menuju: 🔥 Kebakaran — Cibinong      │
│                                            │
│ 📍 Jarak ke TKP   : 2.3 km                │
│ ⏱️  ETA             : ~8 menit             │
│ 🚗 Kecepatan       : 42 km/h              │
│                                            │
│ Progress perjalanan:                       │
│ ━━━━━━━━━━━━━━━━━░░░░  75%               │
│ Start          Sekarang              TKP   │
│                                            │
│ [Lacak di Peta]                            │
└────────────────────────────────────────────┘
```

Jika ada 2+ coordinator EN_ROUTE: panel jadi scrollable list.

Simulasi progress:
- Progress bar: bertambah 1% setiap 5 detik (useEffect + setInterval)
- ETA: hitung mundur berdasarkan progress (simulasi: 8 menit → 0)
- Kecepatan: random fluktuasi antara 30-55 km/h

## 2. ROUTE LINE DI PETA

Saat coordinator EN_ROUTE, gambar Leaflet Polyline:

```javascript
// Koordinat mock route dari posisi coordinator ke lokasi alert:
const routeCoords = [
  [-6.5021, 106.8487], // Posisi coordinator saat ini
  [-6.4921, 106.8387], // Titik tengah 1
  [-6.4871, 106.8337], // Titik tengah 2
  [-6.4821, 106.8287], // Lokasi alert (tujuan)
]

// Style polyline:
// EN_ROUTE: warna biru #3b82f6, weight 3, dashArray "8, 6" (dashed)
// ARRIVED:  warna hijau #22c55e, weight 3, solid
```

Tooltip di polyline (hover): "Dewi — ETA 8 mnt"

## 3. MARKER COORDINATOR BERGERAK (SIMULASI)

Simulasikan pergerakan marker coordinator setiap 10 detik:
```javascript
// Setiap 10 detik, update posisi coordinator sedikit ke arah alert
// Interpolasi linear antara posisi saat ini dan lokasi alert

const moveStep = 0.001 // derajat per langkah
// Hitung bearing dari koordinat coordinator ke koordinat alert
// Update lat/lng coordinator += (bearing direction * moveStep)
```

Style marker coordinator EN_ROUTE:
- Warna biru lebih terang
- Tambah chevron/arrow menunjuk arah pergerakan
- Ripple animation biru terus berputar
- Tooltip: "🔵 Dewi — Menuju TKP"

Saat ARRIVED:
- Marker berubah hijau
- Ripple berhenti
- Tooltip: "🟢 Dewi — Sudah Tiba"

## 4. TOMBOL SIMULASI KOORDINATOR

Tambahkan di toolbar: `[🔵 Sim: Coordinator]` (dropdown):

```
• Dewi ACC & Mulai Jalan
• Simulasi TIBA di Lokasi
• Reset Simulasi
```

### Klik "Dewi ACC & Mulai Jalan":
Urutan animasi:
1. Toast muncul pojok kanan atas:
   ```
   ┌──────────────────────────────────────────────┐
   │ 🔵 Coordinator sedang menuju lokasi darurat  │
   │ Dewi Kusuma → 🔥 Kebakaran Cibinong         │
   │ ETA: ~8 menit                               │
   └──────────────────────────────────────────────┘
   ```
   Auto dismiss 5 detik

2. Panel Coordinator Tracker muncul (slide dari kanan)
3. Route line biru dashed muncul di peta
4. Marker Dewi: ripple animation mulai
5. Marker mulai bergerak perlahan setiap 10 detik

### Klik "Simulasi TIBA":
1. Progress bar → 100%
2. Panel: "🟢 Dewi Kusuma sudah tiba di lokasi!"
3. Route line berubah hijau solid
4. Marker berubah hijau, ripple berhenti
5. Toast: "🟢 Dewi Kusuma telah tiba di TKP"
6. Auto dismiss panel setelah 5 detik

### Klik "Reset Simulasi":
- Hapus route line
- Kembalikan marker ke posisi awal
- Sembunyikan panel tracker
- Stop semua interval

## 5. NOTIFIKASI PUSH SIMULASI (MEMBER)

Saat coordinator ACC (klik simulasi), tampilkan juga simulasi notif mobile:
Banner kecil pojok kiri bawah (seperti notif HP):
```
┌──────────────────────────────────┐
│ 📱 Emergency Alert System       │
│ 🔵 Coordinator sedang menuju    │
│    lokasi darurat                │
│ Dewi Kusuma → Kebakaran Cibinong │
│ ETA: ~8 menit         sekarang   │
└──────────────────────────────────┘
```
Auto dismiss 5 detik, slide dari bawah kiri.

## CATATAN
- Gunakan useRef untuk interval IDs (cleanup on unmount)
- Polyline: Leaflet L.polyline() via react-leaflet
- Simulasi pergerakan marker: update state koordinat setiap 10 detik
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #15
- [ ] Panel coordinator tracker tampil
- [ ] Progress bar simulasi bergerak
- [ ] ETA countdown berjalan
- [ ] Kecepatan fluktuasi
- [ ] Route line dashed biru di peta
- [ ] Tooltip di route line
- [ ] Marker coordinator bergerak setiap 10 detik
- [ ] Ripple animation di marker
- [ ] Simulasi ACC: toast + panel + route + ripple
- [ ] Simulasi TIBA: route hijau + panel update
- [ ] Reset simulasi berfungsi
- [ ] Notif simulasi mobile (pojok kiri bawah)
