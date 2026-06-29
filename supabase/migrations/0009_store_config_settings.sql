-- Configurações da loja: dados gerais, envio e integrações

insert into public.store_settings (key, value)
values
  (
    'store_general',
    jsonb_build_object(
      'storeName', 'Luperini Store',
      'legalName', '',
      'document', '',
      'contactEmail', 'contato@luperini.com.br',
      'supportEmail', '',
      'contactPhone', '',
      'whatsapp', '',
      'instagram', ''
    )
  ),
  (
    'store_shipping',
    jsonb_build_object(
      'origin', jsonb_build_object(
        'label', 'Luperini — Centro de envio',
        'zipCode', '',
        'street', '',
        'number', '',
        'complement', '',
        'neighborhood', '',
        'city', '',
        'state', 'SP'
      ),
      'rules', jsonb_build_object(
        'mode', 'fixed',
        'fixedCostCents', 1990,
        'freeShippingMinimumCents', 29900,
        'estimatedDeliveryDaysMin', 5,
        'estimatedDeliveryDaysMax', 12
      ),
      'defaultPackage', jsonb_build_object(
        'weightGrams', 400,
        'heightCm', 5,
        'widthCm', 25,
        'lengthCm', 30
      )
    )
  ),
  (
    'store_integrations',
    jsonb_build_object(
      'melhorEnvio', jsonb_build_object('enabled', false, 'useSandbox', true),
      'mercadoPago', jsonb_build_object('enabled', false),
      'stripe', jsonb_build_object('enabled', false),
      'resend', jsonb_build_object('enabled', false),
      'viaCep', jsonb_build_object('enabled', true)
    )
  )
on conflict (key) do nothing;
