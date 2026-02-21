# 🤖 TRAE PROMPT #7 — DETAIL ALERT + EMERGENCY CHAT
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#6 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/alerts/[id]` (detail satu alert + chat darurat).

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────────────┐
│ ← Kembali ke Alerts    🔥 KEBAKARAN — CRITICAL — ●AKTIF │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│   INFO ALERT (55% lebar)     │  EMERGENCY CHAT (45%)   │
│                              │                          │
│   ─ Header alert             │  ─ Chat messages         │
│   ─ Detail lokasi            │  ─ Input kirim pesan     │
│   ─ Timeline eskalasi        │                          │
│   ─ Daftar responder         │                          │
│   ─ Tombol aksi              │                          │
│                              │                          │
└──────────────────────────────┴──────────────────────────┘
```

## PANEL KIRI — INFO ALERT

### Header Alert:
- Icon besar jenis darurat (64px) + nama + badge severity + badge status
- Badge status "● AKTIF" dengan dot pulse merah
- Waktu trigger: "Dipicu: Sabtu, 21 Feb 2026 pukul 14:23 WIB"
- Trigger source: "📱 App Mobile — Budi Santoso"

### Detail Kejadian:
```
┌────────────────────────────────────────────────┐
│ 📍 Lokasi    : Jl. Raya Cibinong No. 12       │
│               Cibinong, Kab. Bogor            │
│ 🌐 Koordinat : -6.4821, 106.8287              │
│ 📝 Keterangan: "Kebakaran di rumah warga,     │
│                api sudah membesar di lantai 2, │
│                butuh bantuan segera!"          │
└────────────────────────────────────────────────┘
```
Background #22253a, border #2e3248, rounded

### Timeline Eskalasi:
```
✅ 14:23:05 — Alert dipicu oleh Budi Santoso
✅ 14:23:05 — Level 1: Admin Budi Santoso dinotifikasi
✅ 14:24:17 — Admin Budi Santoso acknowledged (1m 12d)
✅ 14:24:17 — Level 2: 3 user terdekat dinotifikasi
⏳ Level 3: Broadcast semua anggota dalam → 00:45
            [Countdown timer live, merah, bold]
```
Timeline: vertical line kiri, dot per event, teks kecil
Event done: dot hijau | Event pending: dot abu | Countdown: dot kuning pulse

### Daftar Responder:
```
┌──────────────────────────────────────────────────┐
│ 👤 Dewi Kusuma          [COORDINATOR]             │
│    🔵 Sedang Menuju Lokasi                       │
│    ETA: ~8 menit  │  Jarak: 3.2 km dari TKP     │
│    Update GPS: 45 detik lalu                     │
├──────────────────────────────────────────────────┤
│ 👤 Eko Prasetyo         [COORDINATOR]            │
│    ✅ Sudah Tahu (Acknowledged)                  │
│    Jarak: 5.1 km dari TKP                        │
├──────────────────────────────────────────────────┤
│ 👤 Gunawan Wijaya       [MEMBER]                 │
│    📬 Baru Dinotifikasi  │  Belum respons        │
└──────────────────────────────────────────────────┘
```
Status responder:
- 🔵 Sedang Menuju → biru
- ✅ Sudah Tahu → hijau
- 📬 Notified → abu
- 🟢 Sudah Tiba → hijau terang

### Tombol Aksi:
```
[👤 Assign Responder Tambahan]    (biru)
[✅ Tandai Selesai]               (hijau)
[❌ Batalkan Alert]               (merah outline)
```

Klik Tandai Selesai → modal konfirmasi:
"Tandai alert ini sebagai selesai? Semua responder akan dinotifikasi."
[Batal] [✅ Ya, Selesaikan]

## PANEL KANAN — EMERGENCY CHAT

Header: "💬 Chat Darurat"
Sub header: "🔥 Kebakaran — Cibinong" | "5 anggota aktif"

### Chat Messages Area (scrollable):
```
─── Sabtu, 21 Feb 2026 ─────────────────

[14:23] 🔴 SISTEM
        Alert 🔥 KEBAKARAN dipicu oleh Budi Santoso
        di Jl. Raya Cibinong No. 12

[14:24] Budi Santoso (MEMBER)
        Api sudah di lantai 2! Butuh bantuan segera,
        ada 3 orang masih di dalam!

[14:24] Dewi Kusuma (COORDINATOR)           ← bubble kiri
        Saya sudah dalam perjalanan, ETA 8 menit.
        Koordinat saya sudah dikirim.

[14:25] Eko Prasetyo (COORDINATOR)          ← bubble kiri
        Saya 5 km dari lokasi, segera kesana

[14:25] Anda (Super Admin)                  ← bubble kanan (biru)
        Tim PMK sudah dihubungi, ETA 10 menit
        
[14:26] 🔴 SISTEM
        Dewi Kusuma mengubah status: Sedang Menuju Lokasi
```

Style pesan:
- Pesan SISTEM: text-centered, bg #22253a, teks abu italic, tidak ada bubble
- Pesan saya (Admin): bubble KANAN, bg biru #1d4ed8, teks putih, border-radius kanan kotak
- Pesan orang lain: bubble KIRI, bg #22253a, teks putih, border-radius kiri kotak
- Nama + role badge di atas setiap bubble orang lain
- Timestamp kecil abu di setiap pesan
- Date divider antar hari

### Input Chat:
```
┌─────────────────────────────────────────────────┐
│ [📎]  Ketik pesan darurat...          [Kirim →] │
└─────────────────────────────────────────────────┘
```
- Input: bg #22253a, border #2e3248, focus border merah
- Tombol Kirim: bg merah, hover lebih terang
- Enter key = kirim
- Setelah kirim: pesan muncul di chat (useState), input kosong
- Auto-scroll ke pesan terbaru

## CATATAN
- useState untuk chat messages (mock, belum Socket.io)
- Countdown eskalasi: useEffect + setInterval
- Semua teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #8
- [ ] Layout dua kolom Info + Chat
- [ ] Header alert dengan badge severity + status
- [ ] Detail lokasi dan keterangan tampil
- [ ] Timeline eskalasi dengan countdown live
- [ ] Daftar 3 responder dengan status berbeda
- [ ] 3 tombol aksi + modal konfirmasi selesai
- [ ] Chat area dengan 6 mock pesan
- [ ] Bubble kiri/kanan sesuai pengirim
- [ ] Pesan sistem style berbeda
- [ ] Input chat + kirim berfungsi
- [ ] Auto-scroll ke bawah
