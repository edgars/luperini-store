-- Extend Instagram embeds to support Instagram + TikTok

do $$ begin
  create type social_platform as enum ('instagram', 'tiktok');
exception
  when duplicate_object then null;
end $$;

alter table if exists public.product_instagram_embeds
  rename to product_social_embeds;

alter table public.product_social_embeds
  add column if not exists platform social_platform not null default 'instagram';

drop policy if exists "product_instagram_embeds_public_read" on public.product_social_embeds;
drop policy if exists "admin_all_product_instagram_embeds" on public.product_social_embeds;

create policy "product_social_embeds_public_read"
  on public.product_social_embeds for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.status = 'active'
    )
  );

create policy "admin_all_product_social_embeds"
  on public.product_social_embeds for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
