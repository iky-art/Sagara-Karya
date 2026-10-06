create table public.orders (
  id text primary key check (id ~ '^SK-[0-9]{6}-[A-Z0-9]{4}$'),
  created_at timestamptz not null default now(),
  package text not null, price text not null, needs text[] not null default '{}',
  name text not null check (char_length(name) between 2 and 80),
  wa text, email text,
  city text not null check (char_length(city) between 2 and 80),
  age int not null check (age between 1 and 99),
  notes text check (char_length(notes) <= 1000),
  is_minor boolean not null default false,
  parent_name text, parent_contact text,
  parent_consent boolean not null default false,
  parent_verified boolean not null default false,
  status text not null default 'baru' check (status in ('baru','menunggu_ortu','diproses','selesai','dibatalkan')),
  admin_note text,
  check (wa is not null or email is not null),
  check (is_minor = (age < 17)),
  check (not is_minor or (parent_name is not null and parent_contact is not null and parent_consent))
);
alter table public.orders enable row level security;
-- Pengunjung hanya boleh MENAMBAH pesanan (tidak bisa membaca/mengubah)
create policy "pengunjung bisa memesan" on public.orders for insert to anon
  with check (status in ('baru','menunggu_ortu') and parent_verified = false and admin_note is null);
-- Hanya akun admin (login Supabase Auth) yang bisa membaca/mengubah/menghapus
create policy "admin penuh" on public.orders for all to authenticated using (true) with check (true);
