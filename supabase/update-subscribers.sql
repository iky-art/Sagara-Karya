-- Jalankan SEKALI di SQL Editor Supabase. Aman diulang.
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and char_length(email) <= 120 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  consent boolean not null check (consent),
  confirmed boolean not null default false,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table public.subscribers enable row level security;
-- Pengunjung hanya boleh MENAMBAH alamat (tidak bisa membaca daftar)
drop policy if exists "pengunjung bisa berlangganan" on public.subscribers;
create policy "pengunjung bisa berlangganan" on public.subscribers for insert to anon
  with check (confirmed = false and unsubscribed_at is null);
drop policy if exists "admin kelola pelanggan" on public.subscribers;
create policy "admin kelola pelanggan" on public.subscribers for all to authenticated using (true) with check (true);
