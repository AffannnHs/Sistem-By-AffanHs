# 🤖 TRAE PROMPT #12 — HALAMAN IoT DEVICES
## Emergency Alert System — Web Admin Dashboard
### Prasyarat: Prompt #1–#11 sudah selesai ✅

---

Lanjutkan project. Buat halaman `/dashboard/devices` untuk manajemen IoT device.

## LAYOUT HALAMAN
```
┌──────────────────────────────────────────────────────┐
│ 📡 Manajemen IoT Device          [+ Tambah Device]   │
├──────────────────────────────────────────────────────┤
│ 🔍 Cari device...  [Tipe▼]  [Status▼]  [Grup▼]      │
├─────────┬─────────┬────────────┬──────────────────────┤
│Online: 5│Offline:2│ Warning: 1 │ Total: 8             │
├──────────────────────────────────────────────────────┤
│  GRID DEVICE CARDS (3 kolom)                         │
└──────────────────────────────────────────────────────┘
```

## STAT MINI CARDS (4 kartu kecil sejajar)
- Online: 5 → hijau
- Offline: 2 → merah
- Warning: 1 → kuning
- Total: 8 → biru

## DEVICE CARD

Background #1a1d27, border #2e3248, rounded-lg, padding 16px

```
┌──────────────────────────────────────────┐
│ [IKON TIPE]               [STATUS BADGE] │
│                                          │
│ Sirine Utama - Cibinong                  │
│ Tipe: 🔔 ALARM SIRINE                    │
│ Grup: Grup Bogor                         │
│ 📍 Cibinong, Kab. Bogor                  │
│                                          │
│ ── Status & Signal ─────────────────     │
│ 🟢 Online    Signal: ████░ 80%           │
│ Last ping: 30 detik lalu                 │
│                                          │
│ ── Aktivitas ───────────────────────     │
│ Terakhir dipicu: 2 jam lalu              │
│ Total trigger hari ini: 3x               │
│                                          │
│ [🔔 Test]        [⚙️ Pengaturan]         │
└──────────────────────────────────────────┘
```

Icon tipe device (Lucide React):
- 🔔 ALARM → icon Bell
- 👆 BUTTON → icon TouchpadIcon atau CircleDot
- 📡 SENSOR → icon Radio

Signal bar: 5 kotak kecil, merah jika offline, kuning jika < 50%, hijau jika ≥ 50%

## MOCK DATA (8 device)
```
1. Sirine Utama Cibinong  | ALARM  | Grup Bogor  | 🟢 Online  | 80% | Dipicu 2 jam lalu | 3x hari ini
2. Tombol Panic Kantor    | BUTTON | Grup Bogor  | 🟢 Online  | 95% | Dipicu kemarin    | 0x hari ini
3. Sensor Asap Gudang     | SENSOR | Grup Bogor  | 🟡 Warning | 40% | Dipicu 5 jam lalu | 1x hari ini
4. Sirine Sentul          | ALARM  | Grup Sentul | 🟢 Online  | 70% | Dipicu 3 hari lalu| 0x hari ini
5. Tombol Panic Pos 1     | BUTTON | Grup Sentul | 🟢 Online  | 88% | Belum pernah      | 0x hari ini
6. Sirine Depok           | ALARM  | Grup Depok  | 🔴 Offline | 0%  | Dipicu 1 minggu   | 0x hari ini
7. Sensor Pintu Depok     | SENSOR | Grup Depok  | 🟢 Online  | 65% | Dipicu kemarin    | 0x hari ini
8. Tombol Panic Pos 2     | BUTTON | Grup Depok  | 🔴 Offline | 0%  | Belum pernah      | 0x hari ini
```

Status card style:
- Online → border atas 2px hijau
- Warning → border atas 2px kuning
- Offline → border atas 2px merah + card sedikit redup (opacity 70%)

## MODAL TEST TRIGGER

Klik [🔔 Test]:
```
┌──────────────────────────────────────────┐
│ 🔔 Test Trigger Device                  │
│ ──────────────────────────────────────   │
│ Sirine Utama - Cibinong                 │
│                                         │
│ ⚠️ Device akan berbunyi selama 3       │
│    detik sebagai pengujian.             │
│    Pastikan area sekitar sudah siap.    │
│                                         │
│ [Batal]      [🔔 Trigger Sekarang]      │
└──────────────────────────────────────────┘
```

Setelah klik Trigger:
1. Modal tutup
2. Card device: tampilkan progress bar countdown 3 detik (hijau → merah)
3. Badge "🔔 Testing..." di card selama 3 detik
4. Setelah 3 detik: badge hilang, toast: "✅ Test berhasil — Sirine berbunyi 3 detik"

Tombol Test dinonaktifkan jika device Offline:
- Tooltip: "Device sedang offline"

## MODAL TAMBAH DEVICE

Klik [+ Tambah Device] → modal besar:
```
┌──────────────────────────────────────────────┐
│ 📡 Tambah Device Baru                        │
│ ──────────────────────────────────────────── │
│ Nama Device *                                │
│ [input text: "Sirine Pos 3..."]              │
│                                              │
│ Tipe Device *                                │
│ ● 🔔 Alarm Sirine                           │
│ ○ 👆 Tombol Panic (IoT Button)              │
│ ○ 📡 Sensor                                 │
│                                              │
│ Grup *                                       │
│ [Dropdown: Pilih Grup ▼]                     │
│                                              │
│ Lokasi                                       │
│ [input text: "Nama lokasi..."]               │
│ Latitude  [input] Longitude [input]          │
│                                              │
│ MQTT Topic (auto-generate, bisa diubah)      │
│ [input: "eas/devices/alarm-pos-3"]           │
│                                              │
│ [Batal]          [➕ Tambah Device]          │
└──────────────────────────────────────────────┘
```

Auto-generate MQTT topic dari nama device: lowercase + replace spasi dengan "-"
Validasi: nama, tipe, grup wajib diisi
Setelah tambah: card baru muncul di grid, toast "✅ Device berhasil ditambahkan"

## DRAWER PENGATURAN DEVICE

Klik [⚙️ Pengaturan] → drawer kanan (380px):
```
┌────────────────────────────────────────┐
│ [← Tutup]                             │
│                                        │
│ ⚙️ Pengaturan Device                  │
│ Sirine Utama - Cibinong               │
│ 🟢 Online                             │
│                                        │
│ ── Info Device ──────────────────────  │
│ ID Device   : DEV-001                  │
│ Tipe        : Alarm Sirine             │
│ Grup        : Grup Bogor              │
│ Lokasi      : Cibinong, Kab. Bogor    │
│ MQTT Topic  : eas/devices/sirine-001  │
│ Terdaftar   : 15 Jan 2025             │
│                                        │
│ ── Log Aktivitas (5 terakhir) ──────── │
│ 14:23 - Alert KEBAKARAN dipicu         │
│ 12:01 - Test trigger oleh Admin        │
│ Kemarin 08:15 - Alert MEDIS dipicu    │
│ 3 hari lalu - Test trigger            │
│ 5 hari lalu - Device online kembali   │
│                                        │
│ ── Kontrol ──────────────────────────  │
│ Status Aktif: [Toggle ON ●]           │
│                                        │
│ [✏️ Edit Info]   [🗑️ Hapus Device]     │
└────────────────────────────────────────┘
```

Klik [🗑️ Hapus Device] → modal konfirmasi → hapus dari list + toast merah

## CATATAN
- Semua state useState (mock, belum API)
- Grid: `grid-cols-3` desktop, `grid-cols-2` tablet, `grid-cols-1` mobile
- Countdown test: useEffect + setInterval
- Teks Bahasa Indonesia, TypeScript

---
## ✅ CHECKLIST SEBELUM LANJUT KE PROMPT #13
- [ ] 8 device cards tampil dalam grid 3 kolom
- [ ] Stat mini cards: Online/Offline/Warning/Total
- [ ] Border warna per status device
- [ ] Signal bar visual tampil
- [ ] Device offline: redup + tombol Test disabled
- [ ] Modal test trigger + countdown 3 detik
- [ ] Modal tambah device + validasi + auto MQTT topic
- [ ] Drawer pengaturan slide dari kanan
- [ ] Log aktivitas 5 item
- [ ] Toggle aktif/nonaktif + hapus device
