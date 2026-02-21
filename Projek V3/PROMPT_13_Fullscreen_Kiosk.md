# 🤖 TRAE PROMPT #13 — FULLSCREEN + KIOSK MODE
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#12 sudah selesai ✅

---

Lanjutkan project. Tambahkan Fullscreen Mode dan Kiosk Mode ke Live Map.

## 1. FULLSCREEN MODE

Tombol [⛶ Fullscreen] di toolbar Live Map.

### Behavior Fullscreen:
- Klik → `document.documentElement.requestFullscreen()`
- Sidebar dan navbar HILANG dari tampilan
- Peta mengisi 100vw × 100vh penuh
- ESC key → keluar fullscreen
- Klik tombol [✕ Keluar] → keluar fullscreen

### Overlay Toolbar saat Fullscreen:
Toolbar floating atas (full width, semi-transparent bg #0f1117cc, backdrop-blur):
```
┌──────────────────────────────────────────────────────────────────┐
│ [🛰️ Satelit ▼] [Layer ▼] [⊞ Split] [🔴 Simulasi] [🎮 SA]  [✕]  │
└──────────────────────────────────────────────────────────────────┘
```

Auto-hide behavior:
- Idle 3 detik (tidak ada mouse movement) → toolbar fade out (opacity 0)
- Mouse move → toolbar fade in kembali (opacity 1)
- Transition: 0.3 detik smooth

Gunakan `useEffect` + `setTimeout` + `onMouseMove` untuk mengontrol visibility toolbar.

Status bar bawah tetap tampil saat fullscreen:
```
┌──────────────────────────────────────────────────────────────────┐
│ 🟢 8 Online │ 🚨 3 Alert Aktif │ Koordinat: -6.482, 106.828 │ Z:14│
└──────────────────────────────────────────────────────────────────┘
```

## 2. KIOSK MODE

Route baru: `/dashboard/live-map/kiosk`

Tambahkan tombol [📺 Kiosk Mode] di toolbar Live Map (buka tab baru).

### Karakteristik Kiosk Mode:
- TIDAK ada sidebar, navbar, breadcrumb
- Peta penuh layar permanen (tidak bisa keluar dengan ESC)
- Auto-refresh simulasi setiap 30 detik
- Desain untuk layar TV/monitor besar di ruang kontrol

### Header Bar (60px, atas):
Background #0f1117, border bawah merah tipis #ef4444:
```
┌──────────────────────────────────────────────────────────────────┐
│ 🚨 EMERGENCY ALERT SYSTEM — PUSAT KOMANDO   │  [WAKTU REAL-TIME] │
│ 🟢 Sistem Online │ 8 Online │ 3 Alert Aktif │ Refresh: 00:28    │
└──────────────────────────────────────────────────────────────────┘
```
- Waktu: update setiap detik (HH:MM:SS WIB)
- Countdown refresh: 30 → 0 → reset → simulasi "refresh data"
- Saat refresh: brief flash/pulse di header

### Peta Area:
- Peta Leaflet penuh (height: calc(100vh - 60px - 40px))
- Semua layer aktif: marker user, marker alert, batas kabupaten
- Default style: Satelit
- Tidak ada toolbar, tidak ada layer control (fixed mode)

### Alert Ticker (40px, bawah):
Background #1a1d27, border atas #2e3248:
```
🔴 CRITICAL: Kebakaran — Cibinong, Kab. Bogor — 8 mnt lalu  ●  🟠 HIGH: Medis — Sentul, Kab. Bogor — 22 mnt lalu  ●  🟡 MEDIUM: Bantuan — Depok — 35 mnt lalu  ●
```
Animasi: CSS `@keyframes marquee` berjalan terus dari kanan ke kiri
Speed: sesuai panjang konten

```css
@keyframes ticker-scroll {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
.ticker-content {
  animation: ticker-scroll 30s linear infinite;
  white-space: nowrap;
}
```

Warna dot per severity: merah (CRITICAL), oranye (HIGH), kuning (MEDIUM)

### Panel Info (pojok kiri, floating):
Background #0f1117bb, backdrop-blur, rounded, padding 16px:
```
┌──────────────────────────┐
│ 📊 STATUS REAL-TIME      │
│ ─────────────────────    │
│ Alert Aktif    : 3       │
│  ├ CRITICAL    : 1 🔴    │
│  ├ HIGH        : 1 🟠    │
│  └ MEDIUM      : 1 🟡    │
│                          │
│ Responder Online : 8     │
│ Admin Online     : 3     │
│                          │
│ Update terakhir: 14:35   │
└──────────────────────────┘
```

### Border Effect Kiosk:
Jika ada alert CRITICAL → border effect merah strobo tetap aktif di kiosk mode

### Tombol Kembali (pojok kanan bawah, kecil, semi-transparent):
`[← Kembali ke Dashboard]` → link ke /dashboard

### Auto Zoom Alert di Kiosk:
Setiap 15 detik, auto rotate focus ke alert aktif:
- 0-15 detik: fokus ke alert 1 (CRITICAL)
- 15-30 detik: fokus ke alert 2 (HIGH)
- 30-45 detik: kembali ke Indonesia full view
- Dst (loop)

Animasi smooth flyTo setiap transisi.

## CATATAN
- Kiosk route: `app/(dashboard)/live-map/kiosk/page.tsx` — layout TANPA sidebar/navbar
- Atau buat layout khusus `app/kiosk/layout.tsx` yang kosong (hanya {children})
- Fullscreen API: cek browser support + fallback
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #14
- [ ] Tombol Fullscreen di toolbar berfungsi
- [ ] Saat fullscreen: sidebar + navbar hilang
- [ ] Toolbar overlay auto-hide saat idle 3 detik
- [ ] ESC / tombol [✕] keluar fullscreen
- [ ] Route /live-map/kiosk tersedia
- [ ] Header kiosk: waktu real-time + countdown refresh
- [ ] Peta penuh di kiosk
- [ ] Alert ticker berjalan di bawah
- [ ] Panel info pojok kiri
- [ ] Auto rotate focus alert setiap 15 detik
- [ ] Tombol kembali ke dashboard
