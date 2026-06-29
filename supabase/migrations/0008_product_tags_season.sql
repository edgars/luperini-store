-- Tags, temporada e busca de produtos

do $$ begin
  create type public.product_season as enum (
    'spring',
    'summer',
    'autumn',
    'winter',
    'all_season'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.products
  add column if not exists season public.product_season not null default 'all_season';

create table if not exists public.product_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.product_tag_assignments (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.product_tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

create index if not exists product_tag_assignments_tag_id_idx
  on public.product_tag_assignments (tag_id);

create index if not exists products_season_idx
  on public.products (season);

alter table public.product_tags enable row level security;
alter table public.product_tag_assignments enable row level security;

create policy "admin_all_product_tags"
  on public.product_tags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_all_product_tag_assignments"
  on public.product_tag_assignments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "public_read_product_tags"
  on public.product_tags for select to anon, authenticated
  using (true);

create policy "public_read_product_tag_assignments"
  on public.product_tag_assignments for select to anon, authenticated
  using (true);
