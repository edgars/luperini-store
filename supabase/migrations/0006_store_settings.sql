-- Configurações da loja (home page, etc.)

create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "admin_all_store_settings"
  on public.store_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.store_settings (key, value)
values (
  'home_page',
  jsonb_build_object(
    'navCategoryIds', '[]'::jsonb,
    'hero', jsonb_build_object(
      'eyebrow', 'Lookbook 02 / 26',
      'title', 'Outono Inverno',
      'titleAccent', 'em alta',
      'description', 'Alfaiataria fluida, toques de seda e a paleta nude que define a temporada. Peças pensadas para a mulher que veste elegância sem esforço.',
      'ctaLabel', 'Ver lookbook',
      'ctaHref', '/produtos?sort=lookbook',
      'imageUrl', '/images-main/home-left-hero.png'
    )
  )
)
on conflict (key) do nothing;
