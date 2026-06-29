import { z } from "zod";

export const integrationsSettingsSchema = z.object({
  melhorEnvio: z.object({
    enabled: z.boolean(),
    useSandbox: z.boolean(),
  }),
  mercadoPago: z.object({
    enabled: z.boolean(),
  }),
  stripe: z.object({
    enabled: z.boolean(),
  }),
  resend: z.object({
    enabled: z.boolean(),
  }),
  viaCep: z.object({
    enabled: z.boolean(),
  }),
});

export type IntegrationsSettingsValue = z.infer<
  typeof integrationsSettingsSchema
>;

export const defaultIntegrationsSettings: IntegrationsSettingsValue = {
  melhorEnvio: {
    enabled: false,
    useSandbox: true,
  },
  mercadoPago: {
    enabled: false,
  },
  stripe: {
    enabled: false,
  },
  resend: {
    enabled: false,
  },
  viaCep: {
    enabled: true,
  },
};

export function parseIntegrationsSettingsValue(
  value: unknown,
): IntegrationsSettingsValue {
  const parsed = integrationsSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultIntegrationsSettings;
}

export type IntegrationEnvStatus = {
  id: string;
  label: string;
  envKeys: string[];
  configured: boolean;
  requiredWhenEnabled: boolean;
};

export function getIntegrationEnvStatuses(
  settings: IntegrationsSettingsValue,
): IntegrationEnvStatus[] {
  const has = (...keys: string[]) =>
    keys.every((key) => Boolean(process.env[key]?.trim()));

  return [
    {
      id: "melhor_envio",
      label: "Melhor Envio",
      envKeys: ["MELHOR_ENVIO_TOKEN"],
      configured: has("MELHOR_ENVIO_TOKEN"),
      requiredWhenEnabled: settings.melhorEnvio.enabled,
    },
    {
      id: "mercadopago",
      label: "Mercado Pago",
      envKeys: ["MERCADOPAGO_ACCESS_TOKEN", "MERCADOPAGO_WEBHOOK_SECRET"],
      configured: has("MERCADOPAGO_ACCESS_TOKEN", "MERCADOPAGO_WEBHOOK_SECRET"),
      requiredWhenEnabled: settings.mercadoPago.enabled,
    },
    {
      id: "stripe",
      label: "Stripe",
      envKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
      configured: has("STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"),
      requiredWhenEnabled: settings.stripe.enabled,
    },
    {
      id: "resend",
      label: "Resend (e-mail)",
      envKeys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
      configured: has("RESEND_API_KEY", "RESEND_FROM_EMAIL"),
      requiredWhenEnabled: settings.resend.enabled,
    },
    {
      id: "viacep",
      label: "ViaCEP",
      envKeys: [],
      configured: true,
      requiredWhenEnabled: settings.viaCep.enabled,
    },
  ];
}
