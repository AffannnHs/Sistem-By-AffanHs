# 🤖 TRAE PROMPT #11 — SUPER ADMIN MAP CONTROL + SETTINGS
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#10 sudah selesai ✅

---

Lanjutkan project. Tambahkan Super Admin Map Control dan halaman Settings.

## 1. SUPER ADMIN CONTROL PANEL

Komponen `SuperAdminMapControl.tsx` — hanya tampil jika role = SUPER_ADMIN.

Panel floating (pojok kiri bawah peta, di atas status bar):
```
┌────────────────────────────────────────┐
│ 🎮 KONTROL SUPER ADMIN                 │
│ ─────────────────────────────────────  │
│ Admin Online Sekarang: 3               │
│ • Budi Santoso (Bogor)      🟢         │
│ • Citra Dewi   (Depok)      🟢         │
│ • Dani Kurnia  (Sentul)     🟡         │
│ ─────────────────────────────────────  │
│ [🗺️ Arahkan SEMUA Admin ke Sini]       │
│                                        │
│ Arahkan ke area preset:                │
│ [Dropdown: Pilih Area ▼]               │
│ [📍 Kirim ke Semua Admin]              │
└────────────────────────────────────────┘
```

Dropdown preset area:
- Seluruh Indonesia (zoom 5)
- Pulau Jawa (zoom 7)
- Sumatera (zoom 7)
- Kalimantan (zoom 7)
- Sulawesi (zoom 7)
- Papua (zoom 7)
- Bali & Nusa Tenggara (zoom 8)

### Behavior Tombol "Arahkan ke Sini":

**Jika ada alert CRITICAL aktif:**
- Tombol merah + teks: "⚡ Arahkan SEMUA (PAKSA)"
- Klik → LANGSUNG tanpa konfirmasi
- Toast merah: "🔴 PAKSA: 3 admin diarahkan ke lokasi CRITICAL"
- Semua peta admin (simulasi): flyTo ke koordinat saat ini

**Jika tidak ada CRITICAL / alert normal:**
- Tombol biru biasa
- Klik → muncul modal konfirmasi:
  ```
  ┌──────────────────────────────────────────┐
  │ 📡 Konfirmasi Siaran Peta               │
  │ ────────────────────────────────────    │
  │ 3 admin online akan diarahkan ke        │
  │ koordinat peta Anda saat ini.           │
  │                                         │
  │ Admin yang akan menerima:               │
  │ • Budi Santoso (Bogor)                  │
  │ • Citra Dewi (Depok)                    │
  │ • Dani Kurnia (Sentul)                  │
  │                                         │
  │ [Batal]      [✅ Ya, Arahkan Semua]     │
  └──────────────────────────────────────────┘
  ```
- Setelah konfirmasi: simulasi notif "Dialihkan oleh Super Admin..." selama 2 detik
- Toast hijau: "✅ 3 admin berhasil diarahkan ke lokasi ini"

### Simulasi Notif Penerima:
Toast/banner kecil di pojok atas:
```
┌────────────────────────────────────────────┐
│ 📡 Dialihkan oleh Super Admin...           │
│    Mengarahkan peta ke Jakarta Selatan     │
│    [Progress bar 2 detik lalu menghilang]  │
└────────────────────────────────────────────┘
```
(Simulasikan dengan setTimeout 2 detik setelah broadcast)

## 2. HALAMAN SETTINGS (/dashboard/settings)

Layout: 2 tab horizontal

### Tab 1: Pengaturan Peta Saya
```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Pengaturan Peta Pribadi                          │
│                                                     │
│ Default Area Pemantauan                             │
│ ─────────────────────────────────────────────────── │
│ ● Preset Wilayah                                    │
│   [Dropdown: Jawa Barat ▼]                          │
│                                                     │
│ ○ Custom Kabupaten/Kota                             │
│   [Provinsi ▼]  [Kab/Kota ▼]                       │
│   (disabled saat preset dipilih)                    │
│                                                     │
│ Style Peta Default                                  │
│ ─────────────────────────────────────────────────── │
│ ● 🛰️ Satelit    ○ 🗺️ Normal                        │
│ ○ 🌑 Gelap      ○ 🏔️ Terrain                       │
│                                                     │
│ Pengaturan Lainnya                                  │
│ ─────────────────────────────────────────────────── │
│ ☑️ Auto-zoom ke alert baru saat masuk               │
│ ☑️ Tampilkan border effect saat alert               │
│ ☐ Simpan zoom level terakhir                       │
│                                                     │
│                    [💾 Simpan Pengaturan]            │
└─────────────────────────────────────────────────────┘
```

### Tab 2: Pengaturan Global (Super Admin only)
```
┌─────────────────────────────────────────────────────┐
│ 🌐 Pengaturan Global                                │
│ ⚠️ Berlaku untuk SEMUA admin                        │
│                                                     │
│ Area Default Global                                 │
│ ─────────────────────────────────────────────────── │
│ [Dropdown: Seluruh Indonesia ▼]                     │
│                                                     │
│ ☑️ Override pengaturan peta individu admin          │
│    (Semua admin ikuti setting global ini)           │
│                                                     │
│ Interval Update GPS                                 │
│ ─────────────────────────────────────────────────── │
│ Mode Normal  : [5 menit ▼]                         │
│ Mode Alert   : [1 menit ▼]                         │
│ Mode SOS     : [15 detik ▼]                        │
│                                                     │
│ Eskalasi Alert                                      │
│ ─────────────────────────────────────────────────── │
│ Delay ke Level 2 : [30 detik ▼]                    │
│ Delay ke Level 3 : [60 detik ▼]                    │
│                                                     │
│            [🚫 Reset ke Default]  [💾 Terapkan]    │
└─────────────────────────────────────────────────────┘
```

Tab Global: hanya tampil jika role = SUPER_ADMIN.
Jika Admin biasa akses tab ini → tampil:
"🔒 Halaman ini hanya untuk Super Admin"

Simpan pengaturan ke localStorage (simulasi persist antar refresh).
Setelah simpan: toast hijau "✅ Pengaturan berhasil disimpan"

## CATATAN
- Role check: gunakan mock state (isSuprAdmin: true)
- Semua state pakai useState + localStorage
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #12
- [ ] Panel Super Admin muncul di pojok kiri bawah peta
- [ ] Daftar 3 admin online tampil
- [ ] Tombol arahkan SEMUA dengan modal konfirmasi (non-critical)
- [ ] Tombol PAKSA merah tanpa konfirmasi (critical)
- [ ] Toast setelah broadcast
- [ ] Simulasi notif penerima "Dialihkan oleh Super Admin"
- [ ] Halaman /settings tampil dengan 2 tab
- [ ] Tab Pengaturan Peta Saya: semua form berfungsi
- [ ] Tab Global: hanya untuk Super Admin
- [ ] Simpan ke localStorage + toast sukses
