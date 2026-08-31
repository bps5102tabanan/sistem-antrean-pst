# 🖥️ Layar Display Sistem Antrean Kunjungan

One-page display (untuk TV/layar lobi) sistem antrean kunjungan **langsung**,
terhubung langsung ke Supabase secara **real-time**.

## ✨ Fitur

- Menampilkan nomor yang sedang **Dipanggil** (besar) + daftar **Menunggu** + riwayat terakhir dipanggil
- Update otomatis (real-time) saat web form lain insert data / status berubah
- Suara pengumuman otomatis bergaya **pramugari**: *"Perhatian, nomor antrean A-001, dipersilakan menuju ke meja pelayanan. Terima kasih."* + nada ding-dong 🔔
- Nomor antrean otomatis `A-001`, `A-002`, … **per hari** (reset tiap hari), **khusus `jenis_kunjungan = 'langsung'`**
- Status otomatis **`menunggu`** saat data pertama kali diisi dari web form lain
  → **web form yang sudah ada TIDAK perlu diubah sama sekali**
- Tombol mute 🔊 dan tombol tes suara

## 📦 Isi Folder

| File | Fungsi |
|---|---|
| `index.html` | Layar display (buka ini) |
| `.env` | **Semua key Supabase** (URL, publishable key, secret key) — file ini diabaikan git |
| `build-config.mjs` | Script pembuat `config.js` dari `.env` → jalankan `node build-config.mjs` |
| `config.js` | Dibuat otomatis dari `.env` — **jangan diedit manual** |
| `config.template.js` | Template untuk script pembuat config |
| `supabase-setup.sql` | SQL yang dijalankan sekali di Supabase |
| `.gitignore` | Memastikan `.env` & `config.js` tidak pernah masuk git |
| `README.md` | Panduan ini |

## 🔐 Soal Key

- **Publishable key** (`sb_publishable_...`) — aman dipakai di frontend, tugasnya memang untuk browser.
- **Secret key** (`sb_secret_...`) — **HANYA untuk server/backend**. Jangan pernah
  memasukkannya ke kode yang berjalan di browser, dan script pembuat config
  (`build-config.mjs`) memang sengaja mengabaikannya.

## 🚀 Cara Pasang

### 1. Isi `.env`

Buka file `.env`, isi `SUPABASE_URL` dengan Project URL kamu
(Supabase → **Settings (⚙️)** → **API** → *Project URL*).

Lalu jalankan di terminal (dari folder ini):

```sh
node build-config.mjs
```

Script ini membaca `.env` → menghasilkan `config.js` (tanpa secret key).
Setiap kali ganti isi `.env`, jalankan ulang script ini.

### 2. Jalankan SQL di Supabase (sekali saja)

1. Buka [Supabase](https://supabase.com) → project kamu → **SQL Editor** → **New query**
2. Salin isi `supabase-setup.sql`, lalu **Run**
   (file ini sudah disesuaikan dengan tabel `visitors` project kamu)

SQL ini akan:
- menambah kolom `status` (default `menunggu`) & `no_antrean`
- membuat **trigger**: setiap INSERT dengan `jenis_kunjungan = 'langsung'`
  otomatis diisi nomor antrean per hari + status `menunggu`
- memberi nomor untuk **data lama** (backfill per hari)
- mengaktifkan **Realtime** supaya layar ikut update otomatis
- membuat policy baca publik (hanya jika RLS aktif)

> ⏰ Hitungan "per hari" memakai zona **WITA (Asia/Makassar)** karena lokasi Bali.
> Kalau beda lokasi, ubah di `supabase-setup.sql`: `Asia/Jakarta` (WIB) atau `Asia/Jayapura` (WIT).

### 3. Buka / pasang di layar

- Buka `index.html` langsung (double-click), **atau**
- lebih baik pakai *Live Server* (VS Code) / hosting statis seperti Netlify, Vercel, GitHub Pages
- Pada layar TV: buka sekali, **klik di mana saja** untuk mengaktifkan suara
  (kebijakan autoplay browser), lalu jangan dimatikan

## 🌐 Deploy ke Vercel (hosting publik)

`config.js` **tidak** ikut di-push ke GitHub (sengaja, demi keamanan key).
Supaya website di Vercel tetap bisa berjalan, Vercel perlu membuat `config.js`
sendiri saat build dari **Environment Variables**. Caranya:

1. Import repo GitHub ini ke Vercel (Vercel Dashboard → **Add New → Project**).
2. Di **Project Settings → Environment Variables**, tambahkan 3 variabel
   (nilainya sama dengan di `.env`):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | `https://pqobeihpxudkxkyowzrz.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` (dari `.env`) |
   | `SUPABASE_TABLE_NAME` | `visitors` |

   > ⚠️ `SUPABASE_SECRET_KEY` **tidak perlu** — frontend tidak boleh tahu secret key.
3. Deploy. File `vercel.json` di repo ini otomatis menjalankan
   `node build-config.mjs` saat build → `config.js` dibuat dari env vars di atas.
4. Kalau build gagal dengan pesan "variabel belum di-set", berarti env vars
   belum lengkap — cek lagi langkah 2, lalu klik **Redeploy**.

## 🔄 Alur Status

```
Web form lain INSERT (langsung)
        │  (otomatis oleh trigger)
        ▼
   status = menunggu  +  no_antrean = A-XXX (per hari)
        │  status diubah jadi "dipanggil"
        ▼
   Layar menampilkan nomor besar + suara:
   "Perhatian. Nomor antrean A-XXX, dipersilakan menuju ke meja pelayanan. Terima kasih."
        │  status diubah jadi "selesai"
        ▼
   Pindah ke daftar "Terakhir Dipanggil"
```

Status diubah dari mana? Dari **Supabase Dashboard** (tabel → edit baris),
atau tombol operator / script lain yang meng-update kolom `status`
(contoh: `update visitors set status = 'dipanggil' where id = ...`).

## ⚠️ Catatan

- Layar hanya menampilkan `jenis_kunjungan = 'langsung'`
- Kalau data lama belum punya nomor/status, jalankan ulang bagian 4–5 di SQL
- Nomor antrean dihitung sederhana (`count + 1`); untuk pemakaian sehari-hari kantor sudah cukup
