"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  normalizeSocialUrl,
  socialSettingsSchema,
  type SocialSettingsValue,
} from "@/lib/store/social-config";
import { saveSocialSettings } from "@/lib/store/get-store-settings";
import type { ActionResult } from "@/types";

function parseSocialForm(formData: FormData): SocialSettingsValue {
  return {
    instagram: normalizeSocialUrl(
      String(formData.get("instagram") ?? ""),
      "instagram",
    ),
    tiktok: normalizeSocialUrl(String(formData.get("tiktok") ?? ""), "tiktok"),
    shopee: normalizeSocialUrl(String(formData.get("shopee") ?? ""), "shopee"),
  };
}

export async function saveSocialConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = socialSettingsSchema.safeParse(parseSocialForm(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await saveSocialSettings(parsed.data);
  } catch {
    return { success: false, error: "Não foi possível salvar as redes sociais." };
  }

  revalidatePath("/admin/configuracoes/redes-sociais");
  revalidatePath("/admin/configuracoes");
  revalidatePath("/", "layout");
  return { success: true };
}
