"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  generalSettingsSchema,
  type GeneralSettingsValue,
} from "@/lib/store/general-config";
import { saveGeneralSettings } from "@/lib/store/get-store-settings";
import type { ActionResult } from "@/types";

function parseGeneralForm(formData: FormData): GeneralSettingsValue {
  return {
    storeName: String(formData.get("storeName") ?? "").trim(),
    legalName: String(formData.get("legalName") ?? "").trim(),
    document: String(formData.get("document") ?? "").trim(),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    supportEmail: String(formData.get("supportEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
  };
}

export async function saveGeneralConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = generalSettingsSchema.safeParse(parseGeneralForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await saveGeneralSettings(parsed.data);
  } catch {
    return { success: false, error: "Não foi possível salvar as configurações." };
  }

  revalidatePath("/admin/configuracoes/loja");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}
