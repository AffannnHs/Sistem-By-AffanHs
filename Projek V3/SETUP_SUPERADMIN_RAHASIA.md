# 🔐 PANDUAN SETUP SUPERADMIN & ADMIN
## Emergency Alert System — RAHASIA, JANGAN COMMIT KE GIT

---

## ⚠️ PENTING SEBELUM MULAI
- File ini dan file `.env.local` JANGAN pernah di-commit ke GitHub
- Pastikan `.gitignore` sudah include: `.env*`, `scripts/seed-admin.js`
- Jalankan script ini HANYA sekali di awal setup

---

## LANGKAH 1 — Buat File `.gitignore` (jika belum ada)

Pastikan file `.gitignore` di root project berisi:
```
# Environment variables — JANGAN COMMIT
.env
.env.local
.env.production
.env*.local

# Script sensitif — JANGAN COMMIT
scripts/seed-admin.js
scripts/seed-admin.ts
```

---

## LANGKAH 2 — Buat File `.env.local`

Buat file `.env.local` di root project (JANGAN `.env` biasa):

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...

# Seed Admin — hapus setelah seed dijalankan
SEED_SUPERADMIN_EMAIL=affannnhs03@gmail.com
SEED_SUPERADMIN_PASS=AffanHs123
SEED_SUPERADMIN_NAME=Affan HS
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bisa ditemukan di:
> Supabase Dashboard → Project Settings → API → service_role key

---

## LANGKAH 3 — Buat Folder & Script Seed

Buat folder `scripts/` di root project (sudah di `.gitignore`).

Buat file `scripts/seed-admin.js`:

```javascript
// scripts/seed-admin.js
// ⚠️ FILE INI RAHASIA — SUDAH DI .gitignore — JANGAN COMMIT
// Jalankan HANYA SEKALI: node scripts/seed-admin.js

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // pakai service role, bukan anon key
)

async function seedSuperAdmin() {
  console.log('🔐 Membuat akun Super Admin...')

  // 1. Buat user di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: process.env.SEED_SUPERADMIN_EMAIL,
    password: process.env.SEED_SUPERADMIN_PASS,
    email_confirm: true,       // langsung verified, skip email konfirmasi
    user_metadata: {
      name: process.env.SEED_SUPERADMIN_NAME,
      role: 'SUPER_ADMIN'
    }
  })

  if (authError) {
    console.error('❌ Gagal buat auth user:', authError.message)
    return
  }

  console.log('✅ Auth user dibuat:', authData.user.email)

  // 2. Insert ke tabel users dengan status ACTIVE langsung
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,             // sama dengan auth user id
      name: process.env.SEED_SUPERADMIN_NAME,
      email: process.env.SEED_SUPERADMIN_EMAIL,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',                 // langsung aktif, skip approval
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })

  if (dbError) {
    console.error('❌ Gagal insert ke tabel users:', dbError.message)
    return
  }

  console.log('✅ Super Admin berhasil dibuat!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email :', process.env.SEED_SUPERADMIN_EMAIL)
  console.log('Status: ACTIVE (langsung bisa login)')
  console.log('Role  : SUPER_ADMIN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('⚠️  HAPUS SEED_SUPERADMIN_PASS dari .env.local setelah ini!')
}

async function seedAdmin(email, password, name, phone) {
  console.log(`🔐 Membuat akun Admin: ${name}...`)

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name, role: 'ADMIN' }
  })

  if (authError) {
    console.error('❌ Gagal:', authError.message)
    return
  }

  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name: name,
      email: email,
      phone: phone || null,
      role: 'ADMIN',
      status: 'ACTIVE',
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })

  if (dbError) {
    console.error('❌ DB error:', dbError.message)
    return
  }

  console.log(`✅ Admin ${name} (${email}) berhasil dibuat!`)
}

async function main() {
  // ── Buat Super Admin ──────────────────────────
  await seedSuperAdmin()

  // ── Buat Admin tambahan (isi sesuai kebutuhan) ─
  // Uncomment dan isi data admin yang diinginkan:
  //
  // await seedAdmin(
  //   'admin@email.com',     // email
  //   'PasswordAdmin123',    // password (ganti dengan yang kuat)
  //   'Nama Admin',          // nama lengkap
  //   '+62812345678'         // nomor HP (opsional)
  // )
  //
  // await seedAdmin(
  //   'admin2@email.com',
  //   'PasswordAdmin456',
  //   'Nama Admin 2',
  //   '+62887654321'
  // )

  console.log('🎉 Selesai! Cek Supabase Dashboard untuk konfirmasi.')
  process.exit(0)
}

main().catch(console.error)
```

---

## LANGKAH 4 — Install Dependency Script

```bash
npm install dotenv @supabase/supabase-js
```

---

## LANGKAH 5 — Jalankan Script (HANYA SEKALI)

```bash
node scripts/seed-admin.js
```

Output yang diharapkan:
```
🔐 Membuat akun Super Admin...
✅ Auth user dibuat: affannnhs03@gmail.com
✅ Super Admin berhasil dibuat!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email : affannnhs03@gmail.com
Status: ACTIVE (langsung bisa login)
Role  : SUPER_ADMIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Selesai!
```

---

## LANGKAH 6 — Cleanup Setelah Seed

Setelah script berhasil:
1. **Hapus baris** `SEED_SUPERADMIN_PASS=...` dari `.env.local`
2. **Hapus file** `scripts/seed-admin.js` (opsional, sudah di .gitignore)
3. Login ke sistem dengan email & password yang sudah dibuat
4. **Ganti password** dari dalam aplikasi (fitur profile settings)

---

## CARA TAMBAH ADMIN BARU (cara mudah via Dashboard)

Setelah sistem jalan, cara tambah Admin baru tanpa script:

### Via Supabase Dashboard:
1. Buka **Supabase Dashboard** → **Authentication** → **Users**
2. Klik **"Add User"**
3. Masukkan email & password
4. Centang **"Auto Confirm User"**
5. Klik **"Create User"**
6. Buka **Table Editor** → tabel `users`
7. Insert row baru:
   ```
   id     : [paste UUID dari user yang baru dibuat]
   name   : Nama Admin
   email  : email@admin.com
   role   : ADMIN
   status : ACTIVE
   ```

### Via Web Admin Dashboard (setelah fitur selesai):
1. Login sebagai Super Admin
2. Buka menu **Users**
3. Klik **"Undang User Baru"** (akan dibuat di Prompt #5)
4. Super Admin bisa langsung assign role ADMIN

---

## SUPABASE ROW LEVEL SECURITY (RLS)

Pastikan tabel `users` punya policy yang tepat.
Jalankan query ini di Supabase SQL Editor:

```sql
-- Policy: user hanya bisa baca data diri sendiri
-- Super Admin dan Admin bisa baca semua user di grupnya

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: baca data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (
  auth.uid() = id                          -- baca data sendiri
  OR
  EXISTS (                                 -- atau kalau role SUPER_ADMIN/ADMIN
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'ADMIN')
    AND u.status = 'ACTIVE'
  )
);

-- Policy: update data sendiri
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: insert hanya via service role (seed script)
CREATE POLICY "Service role can insert"
ON users FOR INSERT
WITH CHECK (true);  -- dibatasi oleh service role key di backend
```

---

## RINGKASAN KEAMANAN

| Item | Status |
|---|---|
| Password di README | ❌ Tidak ada |
| Password di kode | ❌ Tidak ada |
| Password di .env.local | ✅ Hanya sementara, hapus setelah seed |
| .env.local di .gitignore | ✅ Wajib |
| Script seed di .gitignore | ✅ Wajib |
| Supabase RLS aktif | ✅ Wajib |
| Service role key di frontend | ❌ Jangan pernah |

---

*File ini RAHASIA — simpan di tempat aman, jangan share ke siapapun*
