# 🤖 TRAE PROMPT #9 — ANIMASI PETA + ALERT BORDER EFFECT
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#8 sudah selesai ✅

---

Lanjutkan project. Tambahkan semua sistem animasi ke halaman `/dashboard/live-map`.

## 1. ALERT BORDER EFFECT

Buat komponen `AlertBorderEffect.tsx`:
- `position: fixed, inset: 0, pointer-events: none, z-index: 100`
- Props: `severity: 'MEDIUM' | 'HIGH' | 'CRITICAL' | null`
- null = tidak ada efek apapun

```css
/* MEDIUM — Kuning, 1.5 detik cycle */
@keyframes border-medium {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(234,179,8,0); }
  50%       { box-shadow: inset 0 0 20px 4px rgba(234,179,8,0.6); }
}

/* HIGH — Oranye, 0.8 detik cycle */
@keyframes border-high {
  0%, 100% { box-shadow: inset 0 0 0 0 rgba(249,115,22,0); }
  50%       { box-shadow: inset 0 0 30px 6px rgba(249,115,22,0.75); }
}

/* CRITICAL — Merah STROBO, 0.2 detik cycle */
@keyframes border-critical {
  0%, 49% { box-shadow: inset 0 0 50px 12px rgba(239,68,68,0.9); }
  50%,100% { box-shadow: inset 0 0 0 0 rgba(239,68,68,0); }
}

/* Vignette overlay khusus CRITICAL */
.critical-vignette {
  background: radial-gradient(ellipse at center,
    transparent 55%, rgba(239,68,68,0.08) 100%);
}
```

## 2. ANIMATION CONTROLLER HOOK

Buat `useMapAnimation.ts`:

```typescript
// isInViewport(map, lat, lng): boolean
// Cek apakah koordinat ada dalam bounds peta saat ini

// flyToAlert(map, lat, lng, isOutsideViewport, locationName):
//
// JIKA isOutsideViewport = false:
//   map.flyTo([lat, lng], 15, { animate: true, duration: 2 })
//
// JIKA isOutsideViewport = true:
//   Step 1: map.flyTo([-2.5, 118.0], 5, { duration: 1.5 }) ← Indonesia
//   Step 2: setTimeout 2200ms → set showAlertBanner = true
//   Step 3: setTimeout 3200ms → map.flyTo([lat, lng], 15, { duration: 2.5 })
//   Step 4: setTimeout 6000ms → trigger marker bounce animation
```

## 3. ALERT NOTIFICATION BANNER

Komponen `AlertBanner.tsx` — tampil saat alert baru masuk:

```
┌──────────────────────────────────────────────────────────────┐
│ 🔴 ⚠️  ALERT CRITICAL BARU — Pontianak, Kalimantan Barat     │
│        🔥 Kebakaran — Dipicu oleh: Reza Firmansyah           │
│        Baru saja                                             │
│                         [🗺️ Lihat di Peta]   [✕ Tutup]      │
└──────────────────────────────────────────────────────────────┘
```

Style: bg merah gelap #7f1d1d, border merah #ef4444
Animasi: slide-down dari atas (CSS transform translateY)
Auto dismiss: 10 detik (dengan progress bar countdown merah)
Klik "Lihat di Peta": trigger flyToAlert ke lokasi

## 4. TOMBOL SIMULASI DEMO

Tambahkan di toolbar: `[🔴 Simulasi Alert]` (dropdown):

```
Pilih simulasi:
• Alert dalam area (Bogor)
• Alert luar area (Kalimantan Barat)
```

**Simulasi DALAM AREA (Bogor):**
1. Border effect: CRITICAL mulai kedip
2. flyTo langsung ke koordinat Bogor zoom 15 (2 detik)
3. Marker baru bounce di Bogor
4. Alert banner slide down
5. Tombol [⏹ Stop Demo] muncul

**Simulasi LUAR AREA (Kalimantan):**
1. Border effect: CRITICAL strobo mulai
2. flyTo Indonesia center zoom 5 (1.5 detik)
3. Setelah 2 detik: alert banner: "⚠️ ALERT — Pontianak, Kalimantan Barat"
4. Setelah 3 detik: flyTo Pontianak [-0.0263, 109.3425] zoom 15 (2.5 detik)
5. Marker alert baru bounce di Pontianak
6. Border tetap strobo

Tombol [⏹ Stop Demo]: hapus marker baru, stop border effect, reset ke Indonesia

## 5. CSS MARKER ANIMATIONS

Tambahkan di globals.css:

```css
/* Bounce animation saat marker pertama kali muncul */
@keyframes marker-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30%       { transform: translateY(-12px) scale(1.1); }
  60%       { transform: translateY(-6px) scale(1.05); }
}
.marker-new { animation: marker-bounce 0.6s ease-out; }

/* Ripple untuk coordinator EN_ROUTE */
@keyframes coord-ripple {
  0%   { width: 100%; height: 100%; opacity: 0.8; }
  100% { width: 300%; height: 300%; opacity: 0; transform: translate(-33%, -33%); }
}
.marker-enroute::after {
  content: '';
  position: absolute;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  animation: coord-ripple 1.5s infinite;
}

/* Pulse ring untuk CRITICAL alert marker */
@keyframes alert-pulse {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(2.5); opacity: 0; }
}
.pulse-ring { animation: alert-pulse 1.5s infinite; }
```

## 6. KONDISI PENGGUNAAN

AlertBorderEffect menampilkan severity berdasarkan alert aktif tertinggi:
- Ada alert CRITICAL aktif → efek CRITICAL (strobo merah)
- Ada alert HIGH aktif (tidak ada CRITICAL) → efek HIGH (oranye)
- Ada alert MEDIUM aktif (tidak ada yang lebih tinggi) → efek MEDIUM (kuning)
- Tidak ada alert aktif → null (tidak ada efek)

Tambahkan indicator kecil di toolbar: "🔴 1 CRITICAL" atau "Semua Aman 🟢"

## CATATAN
- Gunakan useRef untuk map instance
- Semua animasi CSS, tidak perlu library tambahan
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #10
- [ ] Border effect MEDIUM tampil (kuning, lambat)
- [ ] Border effect HIGH tampil (oranye, sedang)
- [ ] Border effect CRITICAL tampil (merah strobo cepat)
- [ ] Vignette overlay saat CRITICAL
- [ ] Tombol Simulasi dropdown muncul
- [ ] Simulasi dalam area: flyTo langsung zoom in
- [ ] Simulasi luar area: zoom out Indonesia → banner → zoom in Kalimantan
- [ ] Alert banner slide-down dengan countdown
- [ ] Tombol Stop Demo berfungsi
- [ ] Marker baru muncul dengan bounce animation
