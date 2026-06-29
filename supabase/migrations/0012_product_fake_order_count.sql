-- Social proof: contagem fictícia de compras exibida na vitrine

alter table public.products
  add column if not exists fake_order_count integer not null default 0;

comment on column public.products.fake_order_count is
  'Número exibido na página do produto como prova social (não reflete pedidos reais).';
