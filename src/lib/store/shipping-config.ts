import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(2, "Informe um rótulo para o endereço"),
  zipCode: z
    .string()
    .min(8, "Informe o CEP")
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(2, "Informe a rua"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z
    .string()
    .length(2, "Use a sigla do estado (ex: SP)")
    .transform((value) => value.toUpperCase()),
});

export const shippingModeEnum = z.enum([
  "fixed",
  "free_above",
  "melhor_envio",
  "manual",
]);

export const shippingSettingsSchema = z.object({
  origin: addressSchema,
  rules: z.object({
    mode: shippingModeEnum,
    fixedCostCents: z.number().int().min(0),
    freeShippingMinimumCents: z.number().int().min(0),
    estimatedDeliveryDaysMin: z.number().int().min(0).max(90),
    estimatedDeliveryDaysMax: z.number().int().min(0).max(90),
  }),
  defaultPackage: z.object({
    weightGrams: z.number().int().min(1, "Informe o peso padrão"),
    heightCm: z.number().int().min(1, "Informe a altura"),
    widthCm: z.number().int().min(1, "Informe a largura"),
    lengthCm: z.number().int().min(1, "Informe o comprimento"),
  }),
});

export type ShippingSettingsValue = z.infer<typeof shippingSettingsSchema>;
export type ShippingMode = z.infer<typeof shippingModeEnum>;

export const SHIPPING_MODE_LABELS: Record<ShippingMode, string> = {
  fixed: "Frete fixo",
  free_above: "Grátis acima de um valor",
  melhor_envio: "Cotação Melhor Envio",
  manual: "Combinar manualmente (sem cálculo)",
};

export const defaultShippingSettings: ShippingSettingsValue = {
  origin: {
    label: "Luperini — Centro de envio",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
  },
  rules: {
    mode: "fixed",
    fixedCostCents: 1990,
    freeShippingMinimumCents: 29900,
    estimatedDeliveryDaysMin: 5,
    estimatedDeliveryDaysMax: 12,
  },
  defaultPackage: {
    weightGrams: 400,
    heightCm: 5,
    widthCm: 25,
    lengthCm: 30,
  },
};

export function parseShippingSettingsValue(value: unknown): ShippingSettingsValue {
  const parsed = shippingSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultShippingSettings;
}

export function formatZipCode(digits: string) {
  const clean = digits.replace(/\D/g, "").slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function normalizeZipCode(zipCode: string) {
  const digits = zipCode.replace(/\D/g, "");
  if (digits.length !== 8) return zipCode;
  return formatZipCode(digits);
}
