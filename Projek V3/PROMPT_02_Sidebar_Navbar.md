# 🤖 TRAE PROMPT #2 — SIDEBAR + NAVBAR + LAYOUT DASHBOARD
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1 sudah selesai ✅

---

Lanjutkan project Emergency Alert System. Sekarang buat **Sidebar** dan **Navbar** yang dipakai di semua halaman dashboard.

## SIDEBAR — SPESIFIKASI

Lebar: 240px | Background: #1a1d27 | Posisi: fixed kiri

### Logo Area (atas sidebar):
- Icon 🚨 + teks "EAS" besar bold putih
- Teks kecil abu: "Emergency Alert System"
- Border bawah #2e3248

### Menu Items (dengan icon Lucide React):
```
🏠  Dashboard     → /dashboard
🗺️  Live Map      → /dashboard/live-map
🚨  Alerts        → /dashboard/alerts
    └ badge merah bulat: angka 3 (mock alert aktif)
👥  Users         → /dashboard/users
    └ badge kuning: angka 2 (mock pending approval)
📡  Devices       → /dashboard/devices
⚙️  Settings      → /dashboard/settings
```

### Style Menu Item:
- Normal: teks #94a3b8, icon abu, hover background #22253a
- Active (halaman saat ini): teks putih, icon merah #ef4444, left border 3px merah, bg #22253a
- Badge: bulat kecil, bg merah, teks putih 10px bold

### Bagian Bawah Sidebar:
```
┌──────────────────────────────┐
│  [AV]  Ahmad Fauzi           │
│        Super Admin           │
│  ─────────────────────────   │
│  [🚪 Logout]                 │
└──────────────────────────────┘
```
Avatar: lingkaran dengan inisial "AF", bg biru
Logout: hover background merah gelap

## NAVBAR — SPESIFIKASI

Height: 60px | Background: #1a1d27 | Border bawah: #2e3248 | Sticky top

### Kiri Navbar:
- Breadcrumb dinamis sesuai halaman aktif
  Contoh: "Dashboard" / "Dashboard › Live Map" / "Dashboard › Alerts"
- Teks abu, separator ›

### Kanan Navbar:
```
[Status]  [🔔 Bell]  [Avatar ▼]
```

**Status Sistem:**
- Dot hijau animasi pulse + teks "Sistem Online"
- Jika offline: dot merah + "Sistem Offline"

**Bell Notifikasi:**
- Badge merah angka: 5 (mock)
- Klik → dropdown notifikasi (3 item mock):
  ```
  🔥 Alert kebakaran baru — Cibinong    (2 mnt lalu)
  👤 Rudi Hermawan menunggu approval    (15 mnt lalu)
  ✅ Alert medis diselesaikan           (1 jam lalu)
  ────────────────────────────────
  [Lihat Semua Notifikasi]
  ```
- Klik di luar → dropdown tutup

**Avatar Dropdown:**
- Foto/inisial user + nama + chevron
- Dropdown: [👤 Profil] [⚙️ Pengaturan] [🚪 Logout]

## LAYOUT FINAL
```
┌──────────┬────────────────────────────────────────┐
│          │  NAVBAR (60px, sticky top)             │
│ SIDEBAR  ├────────────────────────────────────────┤
│  240px   │                                        │
│  fixed   │   {children}                           │
│  left    │   padding: 24px                        │
│          │   background: #0f1117                  │
│          │   min-height: calc(100vh - 60px)       │
└──────────┴────────────────────────────────────────┘
```

Main content: `ml-[240px]`, padding 24px, bg #0f1117

## HALAMAN PLACEHOLDER
Buat halaman kosong untuk semua route (akan diisi prompt berikutnya):
- `/dashboard` → heading "Dashboard"
- `/dashboard/live-map` → heading "Live Map"
- `/dashboard/alerts` → heading "Alerts"
- `/dashboard/users` → heading "Users"
- `/dashboard/devices` → heading "Devices"
- `/dashboard/settings` → heading "Settings"

Setiap placeholder: tampilkan heading + breadcrumb + teks "Halaman ini akan segera tersedia"

## CATATAN
- Active route detection pakai `usePathname()` dari next/navigation
- Semua teks Bahasa Indonesia
- TypeScript
- 'use client' di komponen interaktif

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #3
- [ ] Sidebar tampil dengan semua menu items
- [ ] Badge merah di Alerts dan badge kuning di Users
- [ ] Active state menu berfungsi (highlight merah)
- [ ] Navbar tampil dengan breadcrumb, bell, avatar
- [ ] Dropdown bell terbuka/tutup
- [ ] Dropdown avatar terbuka/tutup
- [ ] Navigasi antar halaman berfungsi
- [ ] Layout sidebar + navbar konsisten di semua halaman
