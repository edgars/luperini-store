-- Tipografia da loja (fontes e esquemas salvos)

insert into public.store_settings (key, value)
values
  (
    'store_typography',
    jsonb_build_object(
      'applyMode', 'by_element',
      'uniformFont', 'current',
      'elements', jsonb_build_object(
        'h1', 'current',
        'h2', 'current',
        'h3', 'current',
        'paragraph', 'current',
        'buttons', 'current'
      ),
      'presets', '[]'::jsonb
    )
  )
on conflict (key) do nothing;
