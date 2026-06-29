-- Instagram post/reel embeds linked to products

create table if not exists public.product_instagram_embeds (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_instagram_embeds_product_id_idx
  on public.product_instagram_embeds (product_id);

alter table public.product_instagram_embeds enable row level security;

create policy "product_instagram_embeds_public_read"
  on public.product_instagram_embeds for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

create policy "admin_all_product_instagram_embeds"
  on public.product_instagram_embeds for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
