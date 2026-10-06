-- Jalankan SEKALI di SQL Editor Supabase (setelah schema.sql). Aman diulang.
create table if not exists public.paket_harga (name text primary key, price int not null);
insert into public.paket_harga values ('Basic',70000),('Standard',150000),('Advanced',200000),('Custom',500000) on conflict (name) do nothing;
alter table public.paket_harga enable row level security;
drop policy if exists "publik baca harga" on public.paket_harga;
create policy "publik baca harga" on public.paket_harga for select to anon, authenticated using (true);
drop policy if exists "admin kelola harga" on public.paket_harga;
create policy "admin kelola harga" on public.paket_harga for all to authenticated using (true) with check (true);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  kind text not null check (kind in ('persen','nominal')),
  value int not null check (value > 0),
  packages text[] not null default '{}',  -- kosong = semua paket
  starts_at timestamptz, ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'persen' or value <= 100)
);
alter table public.promos enable row level security;
drop policy if exists "publik baca promo berjalan" on public.promos;
create policy "publik baca promo berjalan" on public.promos for select to anon
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()));
drop policy if exists "admin kelola promo" on public.promos;
create policy "admin kelola promo" on public.promos for all to authenticated using (true) with check (true);

alter table public.orders add column if not exists base_price int;
alter table public.orders add column if not exists discount int not null default 0;
alter table public.orders add column if not exists final_price int;
alter table public.orders add column if not exists promo_name text;

create or replace function public.hitung_harga(p_paket text)
returns table(base int, disc int, promo text) language sql stable security definer set search_path = public as $$
  select h.price, coalesce(x.d, 0), x.name
  from paket_harga h
  left join lateral (
    select pr.name, least(h.price, case when pr.kind = 'persen' then h.price * pr.value / 100 else pr.value end)::int as d
    from promos pr
    where pr.active and (pr.starts_at is null or pr.starts_at <= now()) and (pr.ends_at is null or pr.ends_at > now())
      and (cardinality(pr.packages) = 0 or p_paket = any(pr.packages))
    order by 2 desc limit 1
  ) x on true
  where h.name = p_paket
$$;

-- Harga dihitung di server saat pesanan masuk (tidak bisa dimanipulasi dari browser)
create or replace function public.orders_set_harga() returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from public.hitung_harga(new.package);
  if r.base is null then raise exception 'paket tidak dikenal'; end if;
  new.base_price := r.base; new.discount := r.disc; new.final_price := r.base - r.disc; new.promo_name := r.promo;
  return new;
end $$;
drop trigger if exists orders_harga on public.orders;
create trigger orders_harga before insert on public.orders for each row execute function public.orders_set_harga();

-- Cek pesanan publik: hanya data terbatas, nama disamarkan, tanpa kontak
create or replace function public.cek_pesanan(p_id text)
returns table(id text, created_at timestamptz, package text, needs text[], name_masked text, status text,
  is_minor boolean, parent_verified boolean, base_price int, discount int, final_price int, promo_name text)
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.package, o.needs, left(o.name, 1) || '****', o.status,
         o.is_minor, o.parent_verified, o.base_price, o.discount, o.final_price, o.promo_name
  from orders o where o.id = upper(trim(p_id))
$$;
grant execute on function public.cek_pesanan(text) to anon, authenticated;
