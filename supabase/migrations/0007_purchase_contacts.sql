-- Contatos de compras (opcionalmente vinculados a fornecedor)

create table if not exists public.purchase_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text,
  phone text,
  notes text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchase_contacts_supplier_id_idx
  on public.purchase_contacts (supplier_id);

alter table public.purchase_contacts enable row level security;

create policy "admin_all_purchase_contacts"
  on public.purchase_contacts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
