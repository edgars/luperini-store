"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import { saveShippingSettings } from "@/lib/store/get-store-settings";
import { parseReaisToCents } from "@/lib/prices";
import {
  normalizeZipCode,
  shippingSettingsSchema,
  type ShippingSettingsValue,
} from "@/lib/store/shipping-config";
import type { ActionResult } from "@/types";

function parseShippingForm(formData: FormData): ShippingSettingsValue | { error: string } {
  const fixedCost = parseReaisToCents(String(formData.get("fixedCost") ?? ""));
  const freeMinimum = parseReaisToCents(
    String(formData.get("freeShippingMinimum") ?? ""),
  );

  if (fixedCost === null) {
    return { error: "Frete fixo inválido." };
  }

  if (freeMinimum === null) {
    return { error: "Valor mínimo para frete grátis inválido." };
  }

  return {
    origin: {
      label: String(formData.get("originLabel") ?? "").trim(),
      zipCode: normalizeZipCode(String(formData.get("originZipCode") ?? "")),
      street: String(formData.get("originStreet") ?? "").trim(),
      number: String(formData.get("originNumber") ?? "").trim(),
      complement: String(formData.get("originComplement") ?? "").trim(),
      neighborhood: String(formData.get("originNeighborhood") ?? "").trim(),
      city: String(formData.get("originCity") ?? "").trim(),
      state: String(formData.get("originState") ?? "")
        .trim()
        .toUpperCase(),
    },
    rules: {
      mode: String(formData.get("shippingMode")) as ShippingSettingsValue["rules"]["mode"],
      fixedCostCents: fixedCost,
      freeShippingMinimumCents: freeMinimum,
      estimatedDeliveryDaysMin: Number(formData.get("estimatedDeliveryDaysMin") ?? 0),
      estimatedDeliveryDaysMax: Number(formData.get("estimatedDeliveryDaysMax") ?? 0),
    },
    defaultPackage: {
      weightGrams: Number(formData.get("packageWeightGrams") ?? 0),
      heightCm: Number(formData.get("packageHeightCm") ?? 0),
      widthCm: Number(formData.get("packageWidthCm") ?? 0),
      lengthCm: Number(formData.get("packageLengthCm") ?? 0),
    },
  };
}

export async function saveShippingConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const raw = parseShippingForm(formData);
  if ("error" in raw) {
    return { success: false, error: raw.error };
  }

  const parsed = shippingSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  if (
    parsed.data.rules.estimatedDeliveryDaysMax <
    parsed.data.rules.estimatedDeliveryDaysMin
  ) {
    return {
      success: false,
      error: "O prazo máximo deve ser maior ou igual ao mínimo.",
    };
  }

  try {
    await saveShippingSettings(parsed.data);
  } catch {
    return { success: false, error: "Não foi possível salvar as configurações." };
  }

  revalidatePath("/admin/configuracoes/envio");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}
