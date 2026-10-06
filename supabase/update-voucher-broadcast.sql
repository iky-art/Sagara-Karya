-- Jalankan SEKALI di SQL Editor Supabase, SETELAH schema.sql dan update-promo-cek.sql. Aman diulang.
create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{3,20}$'),
  title text not null check (char_length(title) between 2 and 60),
  description text check (char_length(description) <= 500),
  kind text not null check (kind in ('persen','nominal')),
  value int not null check (value > 0),
  packages text[] not null default '{}',
  quota int check (quota is null or quota > 0),
  used int not null default 0,
  starts_at timestamptz, ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (kind <> 'persen' or value <= 100)
);
alter table public.vouchers enable row level security;
drop policy if exists "publik baca voucher berjalan" on public.vouchers;
create policy "publik baca voucher berjalan" on public.vouchers for select to anon
  using (active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now()) and (quota is null or used < quota));
drop policy if exists "admin kelola voucher" on public.vouchers;
create policy "admin kelola voucher" on public.vouchers for all to authenticated using (true) with check (true);

create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  body text not null check (char_length(body) between 1 and 300),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.broadcasts enable row level security;
drop policy if exists "publik baca broadcast aktif" on public.broadcasts;
create policy "publik baca broadcast aktif" on public.broadcasts for select to anon using (active);
drop policy if exists "admin kelola broadcast" on public.broadcasts;
create policy "admin kelola broadcast" on public.broadcasts for all to authenticated using (true) with check (true);

alter table public.orders add column if not exists voucher_code text;
alter table public.orders add column if not exists voucher_discount int not null default 0;

-- Harga dihitung di server: promo dulu, lalu voucher dari sisa harga
create or replace function public.orders_set_harga() returns trigger language plpgsql security definer set search_path = public as $$
declare r record; v record; after_promo int; vd int := 0;
begin
  select * into r from public.hitung_harga(new.package);
  if r.base is null then raise exception 'paket tidak dikenal'; end if;
  after_promo := r.base - r.disc;
  new.voucher_discount := 0;
  if new.voucher_code is not null then
    new.voucher_code := upper(trim(new.voucher_code));
    select * into v from public.vouchers
      where code = new.voucher_code and active
        and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
        and (cardinality(packages) = 0 or new.package = any(packages))
      for update;
    if not found then raise exception 'Voucher tidak valid atau sudah tidak berlaku'; end if;
    if exists (select 1 from public.orders o where o.voucher_code = v.code
               and ((new.wa is not null and o.wa = new.wa) or (new.email is not null and o.email = new.email))) then
      raise exception 'Voucher ini sudah pernah kamu pakai';
    end if;
    update public.vouchers set used = used + 1 where id = v.id and (quota is null or used < quota);
    if not found then raise exception 'Voucher sudah habis'; end if;
    vd := least(after_promo, case when v.kind = 'persen' then after_promo * v.value / 100 else v.value end);
    new.voucher_discount := vd;
  end if;
  new.base_price := r.base; new.discount := r.disc; new.final_price := after_promo - vd; new.promo_name := r.promo;
  return new;
end $$;

drop function if exists public.cek_pesanan(text);
create function public.cek_pesanan(p_id text)
returns table(id text, created_at timestamptz, package text, needs text[], name_masked text, status text,
  is_minor boolean, parent_verified boolean, base_price int, discount int, final_price int, promo_name text,
  voucher_code text, voucher_discount int)
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.package, o.needs, left(o.name, 1) || '****', o.status,
         o.is_minor, o.parent_verified, o.base_price, o.discount, o.final_price, o.promo_name,
         o.voucher_code, o.voucher_discount
  from orders o where o.id = upper(trim(p_id))
$$;
grant execute on function public.cek_pesanan(text) to anon, authenticated;
