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
  try {
    const raw = readFileSync(join(__dirname, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.error('Gagal membaca .env:', e.message);
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

console.log('✅ config.js berhasil dibuat dari .env');
if (missing.length) {
  console.warn('⚠️  Masih kosong/placeholder di .env: ' + missing.join(', '));
}
console.log('ℹ️  SUPABASE_SECRET_KEY tidak dimasukkan ke config.js (sesuai aturan keamanan).');
