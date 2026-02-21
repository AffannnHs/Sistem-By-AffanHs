# 🤖 TRAE PROMPT #4 — HALAMAN PENDING USERS (APPROVAL SYSTEM)
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1, #2, #3 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/users/pending` untuk Admin menyetujui pendaftar baru.

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────┐
│ 👥 Pending Approval              [2 Menunggu]   │
├─────────────────────────────────────────────────┤
│ Filter: [Semua ▼]  [Urutkan: Terbaru ▼]  [🔍]  │
├─────────────────────────────────────────────────┤
│  CARD USER 1                                    │
│  CARD USER 2                                    │
│  (jika kosong: empty state)                     │
└─────────────────────────────────────────────────┘
```

## PENDING USER CARD

Background #1a1d27, border #2e3248, rounded-lg, padding 20px

```
┌──────────────────────────────────────────────────────┐
│  [RH]  Rudi Hermawan                  🕐 2 jam lalu  │
│        rudi@email.com                                │
│        📱 +62 812-1111-2222                          │
│        📍 Sentul, Kab. Bogor (GPS saat mendaftar)    │
├──────────────────────────────────────────────────────┤
│  [✅ Approve & Assign Grup]      [❌ Tolak]           │
└──────────────────────────────────────────────────────┘
```

Avatar: lingkaran inisial, background abu #22253a
Tombol Approve: background biru #3b82f6, hover lebih terang
Tombol Tolak: background transparan, border merah, teks merah, hover bg merah gelap

Mock data 2 pending user:
1. Rudi Hermawan | rudi@email.com | +62 812-1111-2222 | Sentul, Kab. Bogor | 2 jam lalu
2. Siti Rahayu | siti@email.com | +62 813-3333-4444 | Beji, Kota Depok | 5 jam lalu

## MODAL APPROVE

Klik [✅ Approve & Assign Grup] → modal muncul (overlay gelap):

```
┌─────────────────────────────────────────────┐
│  ✅ Approve Pendaftar Baru                  │
│  ────────────────────────────────────────── │
│  Nama  : Rudi Hermawan                      │
│  Email : rudi@email.com                     │
│                                             │
│  Pilih Grup:                                │
│  ┌────────────────────────────────────┐     │
│  │ Grup Cibinong                    ▼ │     │
│  └────────────────────────────────────┘     │
│  Opsi: Grup Cibinong, Grup Sentul,          │
│        Grup Depok, Grup Bogor Kota          │
│                                             │
│  Pilih Role:                                │
│  ○ Member (default)                         │
│  ● Coordinator                              │
│                                             │
│  [Batal]        [✅ Konfirmasi Approve]      │
└─────────────────────────────────────────────┘
```

Setelah klik Konfirmasi:
1. Modal tutup
2. Card user hilang dari list (animasi fade-out)
3. Toast sukses HIJAU pojok kanan atas:
   "✅ Rudi Hermawan berhasil diapprove dan ditambahkan ke Grup Sentul sebagai Member"
4. Jumlah badge pending berkurang (dari 2 → 1)

## MODAL TOLAK

Klik [❌ Tolak] → modal konfirmasi kecil:

```
┌─────────────────────────────────────────────┐
│  ❌ Tolak Pendaftaran                       │
│  ────────────────────────────────────────── │
│  Apakah Anda yakin menolak pendaftaran      │
│  Rudi Hermawan?                             │
│                                             │
│  ⚠️ Akun akan dihapus permanen dan tidak   │
│     bisa dipulihkan.                        │
│                                             │
│  [Batal]              [❌ Ya, Tolak]        │
└─────────────────────────────────────────────┘
```

Tombol "Ya, Tolak": background merah, hover lebih gelap

Setelah tolak:
1. Modal tutup
2. Card hilang (animasi fade-out)
3. Toast MERAH: "❌ Pendaftaran Rudi Hermawan telah ditolak"

## EMPTY STATE

Jika semua sudah diproses (list kosong):
```
┌─────────────────────────────────────────────┐
│                                             │
│              ✅  (icon besar)               │
│                                             │
│       Semua Pendaftar Sudah Diproses        │
│                                             │
│   Tidak ada yang menunggu approval saat ini │
│                                             │
└─────────────────────────────────────────────┘
```

## LINK DARI SIDEBAR

Pastikan menu "Users" di sidebar punya sub-menu atau badge yang mengarah ke halaman ini. Atau tambahkan tombol "Pending (2)" di halaman `/dashboard/users` yang link ke halaman ini.

## CATATAN
- Semua state: useState (mock, belum connect API)
- Animasi fade-out card pakai CSS transition opacity + height
- Semua teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #5
- [ ] 2 card pending user tampil
- [ ] Modal approve terbuka dengan dropdown grup + radio role
- [ ] Setelah approve: card hilang + toast hijau
- [ ] Modal tolak terbuka dengan konfirmasi
- [ ] Setelah tolak: card hilang + toast merah
- [ ] Empty state tampil saat semua diproses
- [ ] Badge jumlah update saat ada yang diproses
