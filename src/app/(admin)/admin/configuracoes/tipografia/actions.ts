"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import { saveTypographySettings } from "@/lib/store/get-store-settings";
import {
  typographySettingsSchema,
  type TypographySettingsValue,
} from "@/lib/store/typography-config";
import type { ActionResult } from "@/types";

function parseTypographyPayload(raw: unknown): TypographySettingsValue | null {
  if (typeof raw === "string") {
    try {
      return typographySettingsSchema.parse(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  const parsed = typographySettingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function saveTypographyConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const payload = parseTypographyPayload(formData.get("typographyJson"));
  if (!payload) {
    return { success: false, error: "Configuração de tipografia inválida." };
  }

  try {
    await saveTypographySettings(payload);
  } catch {
    return {
      success: false,
      error: "Não foi possível salvar a tipografia.",
    };
  }

  revalidatePath("/admin/configuracoes/tipografia");
  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
  return { success: true };
}
