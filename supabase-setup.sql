-- ============================================================
--  SETUP SISTEM ANTREAN KUNJUNGAN (Supabase)
-- ============================================================
--  Jalankan di: Supabase Dashboard -> SQL Editor -> New query
--
--  Tabel target: public.visitors  (sudah sesuai project kamu)
--
--  Yang dilakukan:
--   1. Menambah kolom status & no_antrean
--   2. Trigger: saat INSERT (khusus jenis_kunjungan = 'langsung')
--      otomatis isi status='menunggu' + nomor antrean per hari
--   3. Backfill nomor & status untuk data lama
--   4. Mengaktifkan Realtime agar layar update otomatis
--   5. Policy baca publik (hanya jika RLS aktif)
-- ============================================================

-- ---------- 1. Kolom status & no_antrean ----------
alter table public.visitors
  add column if not exists status text default 'menunggu';

alter table public.visitors
  add column if not exists no_antrean text;

-- ---------- 2. Zona waktu lokal untuk hitungan "per hari" ----------
-- Contoh: Bali = WITA (Asia/Makassar). Ganti kalau lokasi kamu beda,
-- misal WIB -> 'Asia/Jakarta', WIT -> 'Asia/Jayapura'.
create or replace function public.tanggal_lokal()
returns date
language sql
stable
as $$ select (now() at time zone 'Asia/Makassar')::date $$;

-- ---------- 3. Fungsi + trigger isi nomor antrean otomatis ----------
create or replace function public.assign_no_antrean()
returns trigger
language plpgsql
as $$
declare
  v_prefix text := 'A';   -- prefix loket. Kalau banyak loket, ganti logikanya
  v_count  int;
begin
  if new.jenis_kunjungan = 'langsung' then
    -- hitung sudah berapa antrean hari ini
    select count(*) into v_count
    from public.visitors
    where jenis_kunjungan = 'langsung'
      and (created_at at time zone 'Asia/Makassar')::date = public.tanggal_lokal();

    new.no_antrean := v_prefix || '-' || lpad((v_count + 1)::text, 3, '0');
    new.status     := 'menunggu';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_no_antrean on public.visitors;
create trigger trg_assign_no_antrean
  before insert on public.visitors
  for each row execute function public.assign_no_antrean();

-- ---------- 4. Backfill nomor untuk data lama (per hari) ----------
with numbered as (
  select id,
         row_number() over (
           partition by (created_at at time zone 'Asia/Makassar')::date
           order by created_at
         ) as rn
  from public.visitors
  where jenis_kunjungan = 'langsung'
    and no_antrean is null
)
update public.visitors a
set no_antrean = 'A-' || lpad(n.rn::text, 3, '0')
from numbered n
where a.id = n.id;

-- ---------- 5. Status data lama -> 'menunggu' ----------
update public.visitors
set status = 'menunggu'
where jenis_kunjungan = 'langsung'
  and (status is null or status = '');

-- ---------- 6. Aktifkan Realtime untuk tabel ----------
do $$
begin
  alter publication supabase_realtime add table public.visitors;
exception
  when duplicate_object then null;  -- sudah terdaftar
  when undefined_object then null;  -- publication tidak ada
end $$;

-- ---------- 7. Policy baca publik (aman, hanya dibuat jika RLS aktif) ----------
do $$
begin
  if (select relrowsecurity from pg_class where oid = 'public.visitors'::regclass) then
    execute 'drop policy if exists "visitors_baca_publik" on public.visitors';
    execute 'create policy "visitors_baca_publik" on public.visitors for select using (true)';
  end if;
end $$;
