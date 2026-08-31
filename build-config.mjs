// ============================================================
//  Pembuat config.js dari .env
//  Jalankan:  node build-config.mjs
//
//  ⚠️  Script ini sengaja TIDAK membaca SUPABASE_SECRET_KEY.
//      Secret key hanya untuk server/backend, jangan pernah
//      dimasukkan ke file yang dimuat browser.
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  let raw;
  try {
    raw = readFileSync(join(__dirname, '.env'), 'utf8');
  } catch (e) {
    // File .env tidak ada (misalnya saat build di Vercel) —
    // nilai diambil dari environment variable proses (process.env).
    if (e.code !== 'ENOENT') console.warn('Gagal membaca .env:', e.message);
    return env;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };
const template = readFileSync(join(__dirname, 'config.template.js'), 'utf8');

const out = template
  .replaceAll('__SUPABASE_URL__', env.SUPABASE_URL || '')
  .replaceAll('__SUPABASE_PUBLISHABLE_KEY__', env.SUPABASE_PUBLISHABLE_KEY || '')
  .replaceAll('__SUPABASE_TABLE_NAME__', env.SUPABASE_TABLE_NAME || 'visitors');

writeFileSync(join(__dirname, 'config.js'), out);

const missing = [];
if (!env.SUPABASE_URL || env.SUPABASE_URL.includes('GANTI')) missing.push('SUPABASE_URL');
if (!env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY.includes('GANTI')) missing.push('SUPABASE_PUBLISHABLE_KEY');

if (missing.length) {
  console.error('❌ GAGAL membuat config.js — variabel belum di-set: ' + missing.join(', '));
  console.error('   Lokal : isi file .env lalu jalankan ulang "node build-config.mjs".');
  console.error('   Vercel: tambahkan Environment Variables di Project Settings → Environment Variables, lalu Redeploy.');
  process.exit(1);
}

console.log('✅ config.js berhasil dibuat');
console.log('ℹ️  SUPABASE_SECRET_KEY tidak dimasukkan ke config.js (sesuai aturan keamanan).');
