-- Redes sociais da loja (footer e site)

insert into public.store_settings (key, value)
values
  (
    'store_social',
    jsonb_build_object(
      'instagram', 'https://www.instagram.com/store.luperini/',
      'tiktok', '#',
      'shopee', '#'
    )
  )
on conflict (key) do update
set
  value = excluded.value,
  updated_at = now();
