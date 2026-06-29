-- Produto em destaque na home (máx. 5 via aplicação)

alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists products_featured_active_idx
  on public.products (is_featured)
  where is_featured = true;
