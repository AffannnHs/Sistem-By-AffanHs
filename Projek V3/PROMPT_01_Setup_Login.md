# 🤖 TRAE PROMPT #1 — PROJECT SETUP + HALAMAN LOGIN
## Emergency Alert System — Web Admin Dashboard
### Kirim prompt ini PERTAMA sebelum yang lain

---

Saya akan membangun Web Admin Dashboard untuk sistem **Emergency Alert System** menggunakan Next.js 14 (App Router) + Tailwind CSS + Shadcn/UI.

## TECH STACK
- Framework: Next.js 14 App Router + TypeScript
- Styling: Tailwind CSS
- UI: Shadcn/UI + Lucide React
- Font: Inter (Google Fonts)
- Theme: Dark (profesional, darurat)

## DESIGN SYSTEM (gunakan konsisten di semua halaman)
```
Background utama : #0f1117
Background card  : #1a1d27
Background panel : #22253a
Border           : #2e3248
Aksen merah      : #ef4444  (CRITICAL / darurat)
Aksen oranye     : #f97316  (HIGH)
Aksen kuning     : #eab308  (MEDIUM)
Aksen hijau      : #22c55e  (online / resolved)
Aksen biru       : #3b82f6  (coordinator / info)
Teks utama       : #f1f5f9
Teks sekunder    : #94a3b8
```

## STRUKTUR FOLDER
```
emergency-alert-web/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   └── (dashboard)/
│       └── layout.tsx  ← scaffold kosong dulu
├── components/ui/
├── lib/utils.ts
└── tailwind.config.ts
```

## HALAMAN LOGIN — SPESIFIKASI LENGKAP

Layout: full screen dark (#0f1117), card centered max-width 420px

Isi card:
- Icon 🚨 dengan subtle red glow di atas
- Judul: "EMERGENCY ALERT SYSTEM" (bold, putih)
- Subjudul: "Admin Control Panel" (abu, kecil)
- Garis pemisah
- Input Email (label + input dark theme, focus border merah)
- Input Password (label + input + toggle show/hide icon mata)
- Tombol LOGIN (full width, background merah #ef4444, hover lebih terang, loading spinner saat proses)
- Garis pemisah
- Teks peringatan kecil: "⚠️ Akses terbatas untuk personel terotorisasi"
- Pojok kanan bawah layar: teks kecil "v1.0.0 — Secure Access"

```
┌─────────────────────────────────┐
│                                 │
│   🚨  [Icon Sirine + glow]      │
│   EMERGENCY ALERT SYSTEM        │
│   Admin Control Panel           │
│                                 │
│   ─────────────────────────     │
│                                 │
│   Email Address                 │
│   [input: email]                │
│                                 │
│   Password                      │
│   [input: password] [👁 show]   │
│                                 │
│   [  🔐 LOGIN SEKARANG  ]       │
│                                 │
│   ─────────────────────────     │
│   ⚠️  Akses terbatas untuk      │
│      personel terotorisasi      │
│                                 │
└─────────────────────────────────┘
                       v1.0.0 — Secure Access
```

Behavior Login:
- Email & password wajib diisi (validasi client-side)
- Loading spinner 1.5 detik simulasi
- SUKSES: email=`admin@emergency.com` password=`admin123` → redirect `/dashboard`
- GAGAL: error merah "Email atau password salah. Silakan coba lagi."
- Toggle show/hide password berfungsi
- Enter key = submit form
- Card: fade-in animation saat halaman load

## DASHBOARD LAYOUT SCAFFOLD
Buat `app/(dashboard)/layout.tsx`:
- Sidebar kiri 240px (background #1a1d27)
- Main content area flex-1
- Menu placeholder: Dashboard, Live Map, Alerts, Users, Devices, Settings
- Belum perlu fungsional, cukup struktur HTML/JSX

## CATATAN
- Gunakan `'use client'` di komponen yang pakai useState/event handler
- Semua teks UI dalam Bahasa Indonesia
- TypeScript strict
- Kode clean dengan komentar singkat di bagian penting

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #2
- [ ] `npm run dev` berjalan tanpa error
- [ ] Halaman `/login` tampil dengan dark theme
- [ ] Input email & password berfungsi
- [ ] Toggle show/hide password berfungsi
- [ ] Login admin@emergency.com / admin123 → redirect /dashboard
- [ ] Login salah → pesan error merah muncul
- [ ] Layout /dashboard tampil (sidebar + main area)
