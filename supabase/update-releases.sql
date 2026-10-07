-- Jalankan SEKALI di SQL Editor Supabase. Aman diulang.
create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  version text not null unique check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  title text check (char_length(title) <= 80),
  notes text[] not null default '{}',
  wajib boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.releases enable row level security;
drop policy if exists "publik baca rilis" on public.releases;
create policy "publik baca rilis" on public.releases for select to anon using (true);
drop policy if exists "admin kelola rilis" on public.releases;
create policy "admin kelola rilis" on public.releases for all to authenticated using (true) with check (true);
