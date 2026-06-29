-- Fornecedores e histórico de compras

do $$ begin
  create type public.purchase_source as enum ('supplier', 'in_house');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  document text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists purchase_source public.purchase_source not null default 'in_house',
  add column if not exists supplier_id uuid references public.suppliers(id) on delete set null;

create table if not exists public.supplier_purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  source public.purchase_source not null,
  quantity integer not null,
  unit_cost integer not null,
  total_cost integer not null,
  purchased_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists supplier_purchases_supplier_id_idx
  on public.supplier_purchases (supplier_id);

create index if not exists supplier_purchases_product_id_idx
  on public.supplier_purchases (product_id);

create index if not exists products_supplier_id_idx
  on public.products (supplier_id);

alter table public.suppliers enable row level security;
alter table public.supplier_purchases enable row level security;

create policy "admin_all_suppliers"
  on public.suppliers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_all_supplier_purchases"
  on public.supplier_purchases for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
