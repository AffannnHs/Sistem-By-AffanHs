# 🤖 TRAE PROMPT #15 — POLISH + TOAST SYSTEM + FINAL
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#14 sudah selesai ✅ — PROMPT TERAKHIR!

---

Lanjutkan project. Ini prompt terakhir. Lakukan polish menyeluruh dan tambahkan fitur final.

## 1. TOAST NOTIFICATION SYSTEM

Buat `ToastManager.tsx` dan context `useToast` yang dipakai di seluruh app.

Posisi: pojok kanan atas, stack ke bawah, max 5 toast bersamaan
Animasi: slide dari kanan + fade, dismiss dengan slide ke kanan

### Tipe Toast:
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'alert'
```

Style per tipe:
- success → bg #14532d, border #22c55e, icon ✅
- error → bg #7f1d1d, border #ef4444, icon ❌
- warning → bg #713f12, border #eab308, icon ⚠️
- info → bg #1e3a5f, border #3b82f6, icon ℹ️
- alert → bg #7f1d1d, border #ef4444 terang, LEBIH BESAR, icon 🚨

### Toast Normal (success/error/warning/info):
```
┌────────────────────────────────────────────┐
│ ✅  Rudi Hermawan berhasil diapprove       │
│     [████████████████░░░░] 5 detik        │
│                                   [✕]     │
└────────────────────────────────────────────┘
```
Auto-dismiss: 5 detik (progress bar countdown)

### Toast Alert Darurat (tipe: alert):
```
┌────────────────────────────────────────────────┐
│ 🚨  ALERT CRITICAL BARU                        │
│     🔥 Kebakaran — Jl. Raya Cibinong           │
│     Pelapor: Budi Santoso — Baru saja          │
│     [████████████████░░░░] 10 detik           │
│     [🗺️ Lihat di Peta]              [✕]       │
└────────────────────────────────────────────────┘
```
Auto-dismiss: 10 detik. Ukuran lebih besar dari toast biasa.

## 2. SKELETON LOADING STATES

Buat `Skeleton.tsx` komponen reusable dengan shimmer animation:
```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #22253a 25%, #2e3248 50%, #22253a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

Tambahkan skeleton di semua halaman (tampil 1.5 detik lalu hilang pakai setTimeout):

**Dashboard:** 4 skeleton cards + 3 skeleton alert rows
**Users:** skeleton table dengan 6 rows
**Alerts:** 3 skeleton alert cards
**Devices:** 6 skeleton device cards
**Live Map:** overlay "⏳ Memuat peta..." di tengah peta

## 3. EMPTY STATES

Tambahkan empty state yang proper saat data kosong:

**Alerts (tidak ada alert aktif):**
```
       🎉
Tidak ada alert saat ini
     Semua aman!
```
Icon 🎉 besar (64px), teks putih, sub abu

**Users Pending (kosong):**
```
       ✅
Semua pendaftar sudah diproses
Tidak ada yang menunggu approval
```

**Devices (kosong):**
```
       📡
Belum ada device terdaftar
[+ Tambah Device Pertama]
```
Button action di empty state

**Chat (baru dibuka):**
```
       💬
Belum ada pesan
Mulai komunikasi darurat di sini
```

## 4. HALAMAN 404

Buat `app/not-found.tsx`:
```
         🚨
   404 — Halaman Tidak Ditemukan

Halaman yang Anda cari tidak ada
   atau telah dipindahkan.

   [← Kembali ke Dashboard]
```
Full dark theme, centered, animated icon glow merah

## 5. RESPONSIF DASAR

### Breakpoints:
- Desktop (≥1280px): layout penuh, sidebar 240px expanded
- Laptop (1024-1279px): sidebar 240px, sedikit kompres padding
- Tablet landscape (768-1023px): sidebar collapse jadi icon-only (64px), tooltip nama menu
- Mobile (<768px): sidebar hidden, hamburger menu, layout stack vertikal

### Sidebar Collapse:
Tambahkan tombol [◀] di header sidebar (desktop) dan hamburger [☰] di navbar (tablet/mobile):
- Collapsed: hanya icon, width 64px
- Expanded: icon + label, width 240px
- Animasi transition lebar smooth 0.3 detik

### Grid Cards Responsif:
- Desktop: 4 kolom stat cards, 3 kolom device cards
- Tablet: 2 kolom stat cards, 2 kolom device cards
- Mobile: 1 kolom semua

## 6. KEYBOARD SHORTCUTS

Tambahkan modal shortcuts dan global key listeners:

Tombol [⌨️] kecil di navbar → modal:
```
┌──────────────────────────────────────────┐
│ ⌨️ Keyboard Shortcuts                   │
│ ──────────────────────────────────────── │
│ F          → Fullscreen peta             │
│ K          → Kiosk mode                  │
│ Ctrl + F   → Focus search               │
│ ESC        → Tutup modal/drawer          │
│ G + D      → Ke Dashboard               │
│ G + M      → Ke Live Map                │
│ G + A      → Ke Alerts                  │
│ G + U      → Ke Users                   │
│ ?          → Tampilkan halaman ini       │
└──────────────────────────────────────────┘
```

Implementasikan shortcut:
- `F` di halaman live-map → toggle fullscreen
- `ESC` → tutup modal/drawer yang terbuka
- `?` → buka modal shortcuts
- `Ctrl+F` → focus ke input search terdekat

## 7. KONSISTENSI FINAL

Lakukan review dan perbaiki:
- [ ] Semua halaman menggunakan warna dari design system
- [ ] Semua teks dalam Bahasa Indonesia
- [ ] Semua button ada hover state
- [ ] Semua form ada validasi + error message
- [ ] Semua modal ada tombol [Batal] + close dengan ESC
- [ ] Semua drawer bisa ditutup klik overlay
- [ ] Loading state di semua tombol submit (spinner + disabled)
- [ ] Tidak ada error TypeScript
- [ ] Tidak ada console.error di browser
- [ ] Semua icon dari Lucide React (konsisten)
- [ ] Font Inter diload dari Google Fonts

## 8. README.md

Buat/update `README.md`:
```markdown
# 🚨 Emergency Alert System — Web Admin Dashboard

Sistem dashboard admin untuk memantau dan mengelola kejadian darurat.

## 🛠️ Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Shadcn/UI
- Leaflet.js + react-leaflet
- Leaflet.heat + Leaflet.markercluster
- Lucide React

## 🚀 Cara Menjalankan
npm install
npm run dev
Buka http://localhost:3000

## 🔐 Login Demo
Email    : admin@emergency.com
Password : admin123

## 📄 Halaman
- /login                    → Login
- /dashboard                → Dashboard utama
- /dashboard/live-map       → Peta live + animasi
- /dashboard/live-map/kiosk → Mode kiosk (TV/monitor)
- /dashboard/alerts         → Daftar alert
- /dashboard/alerts/[id]    → Detail alert + chat
- /dashboard/users          → Manajemen user
- /dashboard/users/pending  → Approval pendaftar
- /dashboard/devices        → IoT devices
- /dashboard/settings       → Pengaturan

## ✨ Fitur Utama
- Dark theme profesional
- Peta Leaflet animasi fly-through cinematik
- Alert border effect per severity (kuning/oranye/merah strobo)
- Marker clustering otomatis
- Heatmap zona rawan
- Split panel alert + peta
- Coordinator tracking real-time (simulasi)
- Kiosk mode untuk ruang kontrol
- Approval system user
- Emergency chat per incident
- Fullscreen mode
- Keyboard shortcuts
```

---
## 🎉 SELESAI! CHECKLIST FINAL

- [ ] Toast system berfungsi di semua halaman
- [ ] Skeleton loading tampil saat pertama load
- [ ] Empty state di semua halaman
- [ ] Halaman 404 tampil dengan dark theme
- [ ] Sidebar collapse berfungsi (hamburger + tombol)
- [ ] Responsif di tablet dan mobile
- [ ] Modal keyboard shortcuts terbuka
- [ ] Shortcut F = fullscreen, ESC = tutup modal
- [ ] Tidak ada error TypeScript
- [ ] README.md lengkap
- [ ] `npm run build` berhasil tanpa error

## 🚀 SISTEM SIAP! TOTAL: 15 PROMPT SELESAI
```
Prompt #1  ✅ Setup + Login
Prompt #2  ✅ Sidebar + Navbar + Layout
Prompt #3  ✅ Dashboard Utama
Prompt #4  ✅ Pending Users (Approval)
Prompt #5  ✅ Manajemen Users
Prompt #6  ✅ Daftar Alerts
Prompt #7  ✅ Detail Alert + Emergency Chat
Prompt #8  ✅ Live Map (Leaflet + Markers)
Prompt #9  ✅ Animasi Peta + Border Effect
Prompt #10 ✅ Heatmap + Cluster + MiniMap + Split
Prompt #11 ✅ Super Admin Control + Settings
Prompt #12 ✅ IoT Devices
Prompt #13 ✅ Fullscreen + Kiosk Mode
Prompt #14 ✅ Coordinator Tracking + Route Line
Prompt #15 ✅ Polish + Toast + Final
```
