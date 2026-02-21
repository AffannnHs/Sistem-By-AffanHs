# 🤖 TRAE PROMPT #3 — DASHBOARD UTAMA (STATS + ALERT FEED)
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1 & #2 sudah selesai ✅

---

Lanjutkan project. Isi halaman `/dashboard` (halaman utama setelah login).

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────────┐
│  Selamat datang, Ahmad! — Sabtu, 21 Feb 2026  🕐    │
├──────────┬──────────┬──────────┬───────────────────┤
│ STAT 1   │ STAT 2   │ STAT 3   │ STAT 4            │
├──────────┴──────────┴──────────┴───────────────────┤
│  ALERT AKTIF (kiri 60%)       │  STATISTIK (40%)   │
├───────────────────────────────┤                    │
│  RESPONDER AKTIF              │                    │
└───────────────────────────────┴────────────────────┘
```

## 1. HEADER HALAMAN
- Teks besar: "Selamat datang, Ahmad! 👋"
- Teks kecil abu: tanggal hari ini real-time (pakai `new Date()`)
- Pojok kanan: jam real-time update setiap detik

## 2. STAT CARDS (4 kartu sejajar)
Background #1a1d27, border #2e3248, rounded-lg, padding 20px, shadow

```
┌─────────────────┐  ┌─────────────────┐
│ 🚨              │  │ 📊              │
│ Alert Aktif     │  │ Total Hari Ini  │
│                 │  │                 │
│      3          │  │      12         │
│                 │  │                 │
│ 2 CRITICAL      │  │ ↑ 4 dari        │
│ 1 HIGH          │  │   kemarin       │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ 👥              │  │ ✅              │
│ Responder Online│  │ Diselesaikan    │
│                 │  │                 │
│      8          │  │      9          │
│                 │  │                 │
│ dari 15         │  │ hari ini        │
│ terdaftar       │  │                 │
└─────────────────┘  └─────────────────┘
```

Warna icon per card:
- Alert Aktif: merah #ef4444
- Total Hari Ini: biru #3b82f6
- Responder Online: hijau #22c55e
- Diselesaikan: hijau #22c55e

Angka besar: 36px bold putih
Sub teks: 12px abu

## 3. ALERT FEED (kiri bawah)

Header: `🚨 Alert Aktif` + badge merah angka `3` + tombol kecil `Lihat Semua →`

Mock data 3 alert (urutkan CRITICAL dulu):

**Alert 1 — CRITICAL:**
```
┌─────────────────────────────────────────────────┐  ← border kiri 3px merah
│ [🔥 KEBAKARAN]  [CRITICAL]  [● AKTIF]  │ 8 mnt │
│                                                 │
│ 📍 Jl. Raya Cibinong No. 12, Kab. Bogor        │
│ 👤 Budi Santoso  │  📱 App Mobile              │
│                                                 │
│ Responder: ██████░░ 3 notified, 2 ACK, 1 enroute│
│ ⏱️ Eskalasi Level 2 → 3 dalam: 00:45            │
│                                                 │
│ [👁 Detail]  [💬 Chat]  [👤 Assign]  [✅ Resolve]│
└─────────────────────────────────────────────────┘
```

**Alert 2 — HIGH:**
```
┌─────────────────────────────────────────────────┐  ← border kiri 3px oranye
│ [🏥 MEDIS]  [HIGH]  [● AKTIF]  │ 22 mnt lalu   │
│ 📍 Jl. Sentul Raya, Kab. Bogor                  │
│ 👤 Hana Pertiwi  │  📱 App Mobile               │
│ Responder: 2 notified, 1 ACK                    │
│ [👁 Detail]  [💬 Chat]  [👤 Assign]  [✅ Resolve]│
└─────────────────────────────────────────────────┘
```

**Alert 3 — MEDIUM:**
```
┌─────────────────────────────────────────────────┐  ← border kiri 3px kuning
│ [🆘 BANTUAN]  [MEDIUM]  [● AKTIF]  │ 35 mnt    │
│ 📍 Jl. Margonda, Depok                          │
│ 👤 Irfan Maulana  │  📱 App Mobile              │
│ Responder: 1 notified                           │
│ [👁 Detail]  [💬 Chat]  [👤 Assign]  [✅ Resolve]│
└─────────────────────────────────────────────────┘
```

Badge jenis darurat:
- 🔥 KEBAKARAN → bg merah
- 🏥 MEDIS → bg hijau
- 🦹 KRIMINAL → bg ungu
- 🌊 BENCANA → bg biru
- 🆘 BANTUAN → bg kuning (teks hitam)

Badge CRITICAL: dot animasi pulse merah di badge status "● AKTIF"

## 4. RESPONDER AKTIF (di bawah alert feed)

Header: `👥 Responder Online` + jumlah

4 mock responder:
```
[DK] Dewi Kusuma      COORDINATOR  🔵 Menuju TKP    Cibinong, Bogor
[EP] Eko Prasetyo     COORDINATOR  🟢 Standby       Depok
[GW] Gunawan Wijaya   MEMBER       🟢 Standby       Cibinong
[HP] Hana Pertiwi     MEMBER       🟡 Dalam Tugas   Sentul
```

Avatar: lingkaran inisial, warna per role (biru=coordinator, hijau=member)
Status dot + teks berwarna

## 5. PANEL STATISTIK (kanan)

Header: `📊 Statistik Alert Hari Ini`

**Bar chart CSS (tanpa library):**
- Sumbu X: jam (06.00, 08.00, 10.00, 12.00, 14.00, 16.00)
- Mock data: [1, 0, 2, 3, 4, 2]
- Bar: background merah #ef4444, border-radius atas
- Tinggi relatif terhadap max value

**Breakdown per jenis (di bawah chart):**
```
🔥 Kebakaran  ████░░░░  4 (33%)
🏥 Medis      ███░░░░░  3 (25%)
🦹 Kriminal   ██░░░░░░  2 (17%)
🌊 Bencana    █░░░░░░░  1 (8%)
🆘 Bantuan    ██░░░░░░  2 (17%)
```
Progress bar per item, warna sesuai jenis

## CATATAN
- Semua data mock/dummy
- `useEffect` + `setInterval` untuk jam real-time
- Semua teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #4
- [ ] 4 stat cards tampil dengan data dan ikon
- [ ] Jam real-time update setiap detik
- [ ] 3 alert cards tampil dengan border warna severity
- [ ] Badge severity berwarna
- [ ] 4 responder tampil di list
- [ ] Bar chart dan breakdown jenis alert tampil
