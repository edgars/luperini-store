-- Parceiros/influenciadores e extensão de cupons

create table if not exists public.coupon_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,
  email text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.coupons
  add column if not exists partner_id uuid references public.coupon_partners(id) on delete set null,
  add column if not exists description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.coupons
set code = upper(trim(code))
where code <> upper(trim(code));

create index if not exists coupons_partner_id_idx
  on public.coupons (partner_id);

create index if not exists orders_coupon_id_idx
  on public.orders (coupon_id);

alter table public.coupon_partners enable row level security;

create policy "admin_all_coupon_partners"
  on public.coupon_partners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public_read_active_coupons"
  on public.coupons for select to anon, authenticated
  using (is_active = true);
