// ============================================================
//  TEMPLATE CONFIG — JANGAN EDIT FILE INI LANGSUNG
// ============================================================
//  File config.js dibuat otomatis dari file .env dengan cara:
//
//     node build-config.mjs
//
//  Jadi key tidak pernah ditulis manual di file frontend.
//  Ganti nilai di .env, lalu jalankan script di atas.
// ============================================================

window.SUPABASE_CONFIG = {

  // Project URL dari .env  (SUPABASE_URL)
  url: "__SUPABASE_URL__",

  // Publishable key dari .env  (SUPABASE_PUBLISHABLE_KEY)
  anonKey: "__SUPABASE_PUBLISHABLE_KEY__",

  // Nama tabel dari .env  (SUPABASE_TABLE_NAME)
  tableName: "__SUPABASE_TABLE_NAME__",

  // Nama kolom — sesuaikan kalau nama kolom di tabel kamu beda
  fields: {
    status: "status",                 // kolom status antrean
    noAntrean: "no_antrean",          // kolom nomor antrean, contoh "A-001"
    jenisKunjungan: "jenis_kunjungan",
    nama: "nama",
    asalInstansi: "asal_instansi",
    createdAt: "created_at",
    updatedAt: "updated_at"
  },

  // Hanya tampilkan & diberi nomor untuk jenis kunjungan ini
  jenisLangsung: "langsung",

  // true  -> pengumuman suara menyebut nama, contoh:
  //          "Nomor antrean A 001, atas nama Naufal Abdul Rafi Zaqi,
  //           dipersilakan menuju ke meja pelayanan. Terima kasih."
  // false -> hanya nomor antrean yang disebut
  announceWithName: true
};
