"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  integrationsSettingsSchema,
  type IntegrationsSettingsValue,
} from "@/lib/store/integrations-config";
import { saveIntegrationsSettings } from "@/lib/store/get-store-settings";
import type { ActionResult } from "@/types";

function parseIntegrationsForm(formData: FormData): IntegrationsSettingsValue {
  return {
    melhorEnvio: {
      enabled: formData.get("melhorEnvioEnabled") === "on",
      useSandbox: formData.get("melhorEnvioSandbox") === "on",
    },
    mercadoPago: {
      enabled: formData.get("mercadoPagoEnabled") === "on",
    },
    stripe: {
      enabled: formData.get("stripeEnabled") === "on",
    },
    resend: {
      enabled: formData.get("resendEnabled") === "on",
    },
    viaCep: {
      enabled: formData.get("viaCepEnabled") === "on",
    },
  };
}

export async function saveIntegrationsConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = integrationsSettingsSchema.safeParse(parseIntegrationsForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await saveIntegrationsSettings(parsed.data);
  } catch {
    return { success: false, error: "Não foi possível salvar as configurações." };
  }

  revalidatePath("/admin/configuracoes/integracoes");
  revalidatePath("/admin/configuracoes");
  return { success: true };
}
