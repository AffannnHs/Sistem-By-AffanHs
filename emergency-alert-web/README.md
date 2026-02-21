# 🚨 Emergency Alert System — Web Admin Dashboard

Dashboard admin untuk memantau dan mengelola kejadian darurat.

## 🛠️ Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Zustand
- Leaflet + React Leaflet
- Leaflet.heat + Leaflet.markercluster + Leaflet-minimap
- Lucide React
- (Opsional) Supabase Auth + Postgres

## 🚀 Cara Menjalankan
```bash
npm install
npm run dev
```
Buka `http://localhost:5173/`.

## 🔐 Login Demo
- Email: `admin@emergency.com`
- Password: `admin123`

## 🔧 Env (Opsional Supabase)
- Copy `.env.example` → `.env.local`
- Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`

## 📄 Halaman
- `/login` → Login
- `/dashboard` → Dashboard utama
- `/dashboard/live-map` → Peta live + animasi + layer
- `/dashboard/live-map/kiosk` → Mode kiosk (TV/monitor)
- `/dashboard/alerts` → Daftar alert
- `/dashboard/alerts/:id` → Detail alert + emergency chat
- `/dashboard/users` → Manajemen user
- `/dashboard/users/pending` → Approval pendaftar
- `/dashboard/devices` → IoT devices
- `/dashboard/settings` → Pengaturan

## ⌨️ Keyboard Shortcuts
- `F` → Fullscreen peta (di Live Map)
- `K` → Kiosk mode
- `Ctrl + F` → Fokus ke input search
- `ESC` → Tutup modal/drawer
- `G + D` → Ke Dashboard
- `G + M` → Ke Live Map
- `G + A` → Ke Alerts
- `G + U` → Ke Users
- `?` → Buka daftar shortcut

## ✅ Build
```bash
npm run build
```
