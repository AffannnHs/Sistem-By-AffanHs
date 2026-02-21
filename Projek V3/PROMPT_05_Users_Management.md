# 🤖 TRAE PROMPT #5 — HALAMAN USERS (MANAJEMEN ANGGOTA)
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#4 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/users` lengkap dengan tabel dan drawer detail.

## LAYOUT HALAMAN
```
┌─────────────────────────────────────────────────────┐
│ 👥 Manajemen User              [+ Undang User Baru] │
├─────────────────────────────────────────────────────┤
│ 🔍 Cari nama/email...  [Role▼]  [Grup▼]  [Status▼] │
├─────────────────────────────────────────────────────┤
│ Tab: [Semua(15)] [Admin(2)] [Coordinator(3)] [Member(10)] │
│      [⚠️ Pending(2)] ← link ke /users/pending      │
├─────────────────────────────────────────────────────┤
│  TABEL USER                                         │
├─────────────────────────────────────────────────────┤
│  Pagination: ← 1 2 3 →                             │
└─────────────────────────────────────────────────────┘
```

## TABEL USER

Kolom: `Avatar+Nama` | `Email` | `Role` | `Grup` | `Status` | `Last Seen` | `Aksi`

Header tabel: background #22253a, teks abu uppercase 11px
Row: background #1a1d27, hover #22253a, border bawah #2e3248

Mock data 8 user:
```
1. Ahmad Fauzi      | super@eas.com   | SUPER_ADMIN | Semua       | 🟢 Online      | Sekarang
2. Budi Santoso     | budi@eas.com    | ADMIN       | Grup Bogor  | 🟢 Online      | 2 mnt lalu
3. Dewi Kusuma      | dewi@eas.com    | COORDINATOR | Grup Bogor  | 🟡 Dalam Tugas | 15 mnt lalu
4. Eko Prasetyo     | eko@eas.com     | COORDINATOR | Grup Depok  | 🟢 Online      | 1 mnt lalu
5. Fitri Handayani  | fitri@eas.com   | MEMBER      | Grup Bogor  | 🔴 Offline     | 2 jam lalu
6. Gunawan Wijaya   | gunawan@eas.com | MEMBER      | Grup Bogor  | 🟢 Online      | 5 mnt lalu
7. Hana Pertiwi     | hana@eas.com    | MEMBER      | Grup Depok  | 🟢 Online      | 3 mnt lalu
8. Irfan Maulana    | irfan@eas.com   | MEMBER      | Grup Sentul | 🔴 Offline     | 1 hari lalu
```

Avatar: lingkaran inisial (2 huruf pertama nama), warna per role:
- SUPER_ADMIN → merah #ef4444
- ADMIN → oranye #f97316
- COORDINATOR → biru #3b82f6
- MEMBER → hijau #22c55e

Role badge (pill kecil):
- SUPER_ADMIN → bg merah solid
- ADMIN → bg oranye solid
- COORDINATOR → bg biru solid
- MEMBER → bg abu solid

Status:
- 🟢 Online → dot hijau pulse + teks "Online" hijau
- 🟡 Dalam Tugas → dot kuning + teks kuning
- 🔴 Offline → dot abu + teks "Offline" abu

Kolom Aksi (icon buttons, tooltip on hover):
- 👁 Lihat Detail
- ✏️ Edit Role
- 🚫 Suspend

Row user Suspended: opacity 60%, badge "Ditangguhkan" merah di kolom status

## DRAWER DETAIL USER

Klik [👁 Lihat] → drawer slide dari kanan (width 380px, bg #1a1d27):

```
┌────────────────────────────────────┐
│ [← Tutup]                         │
│                                    │
│      [DK]                          │
│   Dewi Kusuma                      │
│   COORDINATOR — Grup Bogor         │
│   🟡 Sedang Dalam Tugas            │
│                                    │
│ ── Info Kontak ─────────────────── │
│ 📧 dewi@eas.com                    │
│ 📱 +62 812-5555-6666               │
│ 📍 Terakhir: Cibinong, Bogor       │
│                                    │
│ ── Statistik ───────────────────── │
│ Alert direspons  : 47              │
│ Bergabung        : 15 Jan 2025     │
│ Login terakhir   : 20 Feb 2026     │
│                                    │
│ ── Alert Aktif Saat Ini ────────── │
│ ┌──────────────────────────────┐   │
│ │ 🔥 Kebakaran — Cibinong      │   │
│ │ CRITICAL │ Sedang menuju TKP │   │
│ └──────────────────────────────┘   │
│                                    │
│ [✏️ Edit Role]     [🚫 Suspend]    │
└────────────────────────────────────┘
```

Overlay gelap transparan saat drawer terbuka. Klik overlay = tutup drawer.

## MODAL EDIT ROLE

Klik [✏️ Edit Role]:
```
┌──────────────────────────────────────┐
│ ✏️ Edit Role — Dewi Kusuma           │
│ ──────────────────────────────────── │
│ Role saat ini: COORDINATOR           │
│                                      │
│ Role baru:                           │
│ [Dropdown: pilih role ▼]             │
│   • ADMIN                            │
│   • COORDINATOR                      │
│   • MEMBER                           │
│                                      │
│ [Batal]       [💾 Simpan Perubahan]  │
└──────────────────────────────────────┘
```
Setelah simpan: toast hijau "Role Dewi Kusuma berhasil diubah"

## MODAL SUSPEND

Klik [🚫 Suspend]:
```
┌──────────────────────────────────────┐
│ 🚫 Tangguhkan Akun                  │
│ ──────────────────────────────────── │
│ Apakah yakin menangguhkan akun       │
│ Dewi Kusuma?                         │
│ User tidak dapat login sampai        │
│ akun diaktifkan kembali.             │
│                                      │
│ [Batal]       [🚫 Ya, Tangguhkan]    │
└──────────────────────────────────────┘
```
Setelah suspend: row jadi redup + badge "Ditangguhkan", toast merah

## PENCARIAN & FILTER
- Search: filter real-time di client (filter array mock data)
- Tab filter per role: filter array sesuai tab aktif
- Dropdown filter: kombinasi role + grup + status

## CATATAN
- Semua state: useState (mock, belum API)
- Drawer: animasi slide dari kanan (CSS transform translateX)
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #6
- [ ] Tabel 8 user tampil dengan semua kolom
- [ ] Avatar inisial berwarna per role
- [ ] Filter tab per role berfungsi
- [ ] Search real-time berfungsi
- [ ] Drawer detail slide dari kanan
- [ ] Modal edit role berfungsi
- [ ] Modal suspend berfungsi
- [ ] Toast notifikasi muncul setelah aksi
