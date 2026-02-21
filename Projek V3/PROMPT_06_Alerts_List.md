# 🤖 TRAE PROMPT #6 — HALAMAN ALERTS (DAFTAR SEMUA ALERT)
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#5 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/alerts` lengkap.

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────────┐
│ 🚨 Manajemen Alert            [Filter] [📥 Export]  │
├─────────────────────────────────────────────────────┤
│ 🔍 Cari...  [Jenis▼]  [Severity▼]  [Tanggal▼]  [Reset]│
├──────────────────────────────────────────────────────┤
│ Tab: [Aktif(3)] [Eskalasi(1)] [Selesai(9)] [Semua(12)]│
├──────────────────────────────────────────────────────┤
│  ALERT CARD 1                                        │
│  ALERT CARD 2                                        │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

## FILTER BAR
- Search: cari nama pelapor / lokasi (filter real-time)
- Dropdown Jenis: Semua | 🔥 Kebakaran | 🏥 Medis | 🦹 Kriminal | 🌊 Bencana | 🆘 Bantuan
- Dropdown Severity: Semua | CRITICAL | HIGH | MEDIUM | LOW
- Tombol Reset: hapus semua filter

## ALERT CARD — TEMPLATE

```
┌──────────────────────────────────────────────────────────┐
│ [IKON JENIS] [NAMA JENIS] [SEVERITY] [STATUS]  │ WAKTU  │
│                                                          │
│ 📍 [Alamat lengkap]                                      │
│ 👤 Pelapor: [Nama]  │  📡 Trigger: [App Mobile/IoT]     │
│                                                          │
│ ── Eskalasi ──────────────────────────────────────────── │
│ Level [X]/3                                              │
│ [Admin ✅/⏳] → [Terdekat ✅/⏳] → [Semua ✅/⏳]        │
│ [Progress bar warna sesuai severity]                     │
│                                                          │
│ ── Responder ─────────────────────────────────────────── │
│ 📬 [N] notified  │  ✅ [N] ACK  │  🔵 [N] en route      │
│                                                          │
│ [👁 Detail] [💬 Chat] [👤 Assign] [✅ Resolve]           │
└──────────────────────────────────────────────────────────┘
```

Border kiri 3px per severity:
- CRITICAL → merah #ef4444 + subtle red glow background
- HIGH → oranye #f97316
- MEDIUM → kuning #eab308
- LOW → abu #64748b

## MOCK DATA (5 alert)

**Alert 1 — CRITICAL — AKTIF:**
- Jenis: 🔥 KEBAKARAN | Severity: CRITICAL | Status: AKTIF
- Lokasi: Jl. Raya Cibinong No. 12, Cibinong, Kab. Bogor
- Pelapor: Budi Santoso | Trigger: App Mobile | Waktu: 8 mnt lalu
- Eskalasi: Level 2/3 — Admin ✅ | Terdekat ✅ | Semua ⏳
- Responder: 4 notified, 3 ACK, 1 en route

**Alert 2 — HIGH — ESKALASI:**
- Jenis: 🏥 MEDIS | Severity: HIGH | Status: ESKALASI ⚡
- Lokasi: Jl. Sentul Raya No. 5, Sentul, Kab. Bogor
- Pelapor: Hana Pertiwi | Trigger: App Mobile | Waktu: 22 mnt lalu
- Eskalasi: Level 3/3 — SEMUA sudah dinotif | Countdown: 00:32
- Responder: 8 notified, 5 ACK, 2 en route

**Alert 3 — MEDIUM — AKTIF:**
- Jenis: 🆘 BANTUAN | Severity: MEDIUM | Status: AKTIF
- Lokasi: Jl. Margonda Raya, Depok
- Pelapor: Irfan Maulana | Trigger: App Mobile | Waktu: 35 mnt lalu
- Eskalasi: Level 1/3 — Admin ✅ | Terdekat ⏳
- Responder: 2 notified, 1 ACK

**Alert 4 — HIGH — SELESAI:**
- Jenis: 🦹 KRIMINAL | Severity: HIGH | Status: SELESAI ✅
- Lokasi: Jl. Raya Bogor, Cibinong
- Pelapor: Gunawan Wijaya | Waktu: 2 jam lalu
- Diselesaikan oleh: Dewi Kusuma (Coordinator)
- Durasi penanganan: 45 menit

**Alert 5 — CRITICAL — SELESAI:**
- Jenis: 🌊 BENCANA | Severity: CRITICAL | Status: SELESAI ✅
- Lokasi: Jl. Pajajaran, Bogor Kota
- Pelapor: Eko Prasetyo | Waktu: kemarin 16:30
- Diselesaikan: kemarin 18:15 | Durasi: 1j 45m

## BADGE & STATUS STYLE

Badge jenis (pill warna):
- 🔥 KEBAKARAN → bg #ef4444
- 🏥 MEDIS → bg #22c55e
- 🦹 KRIMINAL → bg #a855f7
- 🌊 BENCANA → bg #3b82f6
- 🆘 BANTUAN → bg #eab308 teks hitam

Badge severity:
- CRITICAL → bg merah solid, teks putih
- HIGH → bg oranye solid, teks putih
- MEDIUM → bg kuning solid, teks hitam
- LOW → bg abu solid, teks putih

Badge status:
- ● AKTIF → dot merah pulse + teks merah
- ⚡ ESKALASI → bg oranye berkedip + teks putih
- ✅ SELESAI → bg hijau + teks putih
- (row selesai: sedikit redup, tombol hanya [👁 Detail])

## ESKALASI INDICATOR
Alert yang sedang eskalasi otomatis (Alert 2):
- Badge "⚡ ESKALASI" oranye dengan animasi pulse
- Teks kecil di bawah: "Naik ke Level 3 dalam 00:45" — countdown live

## TOMBOL EXPORT
Klik [📥 Export] → dropdown:
- Export CSV (simulasi download)
- Export PDF (simulasi download)
Toast: "✅ Data alert berhasil diexport"

## CATATAN
- useState mock, belum API
- Tab filter berfungsi di client
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #7
- [ ] 5 alert cards tampil dengan data lengkap
- [ ] Border warna per severity
- [ ] Badge jenis, severity, status berwarna
- [ ] Tab filter Aktif/Eskalasi/Selesai/Semua berfungsi
- [ ] Search dan filter dropdown berfungsi
- [ ] Countdown eskalasi berjalan
- [ ] Alert selesai tampil redup
