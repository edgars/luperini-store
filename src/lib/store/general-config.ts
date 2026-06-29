import { z } from "zod";

export const generalSettingsSchema = z.object({
  storeName: z.string().min(2, "Informe o nome da loja"),
  legalName: z.string().optional(),
  document: z.string().optional(),
  contactEmail: z.string().email("E-mail inválido"),
  supportEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
});

export type GeneralSettingsValue = z.infer<typeof generalSettingsSchema>;

export const defaultGeneralSettings: GeneralSettingsValue = {
  storeName: "Luperini Store",
  legalName: "",
  document: "",
  contactEmail: "contato@luperini.com.br",
  supportEmail: "",
  contactPhone: "",
  whatsapp: "",
  instagram: "",
};

export function parseGeneralSettingsValue(value: unknown): GeneralSettingsValue {
  const parsed = generalSettingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  return defaultGeneralSettings;
}
