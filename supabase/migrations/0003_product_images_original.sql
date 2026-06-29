-- Dual storage: display URL in url, full-resolution WebP in original_url

alter table public.product_images
  add column if not exists original_url text,
  add column if not exists original_width integer,
  add column if not exists original_height integer;
