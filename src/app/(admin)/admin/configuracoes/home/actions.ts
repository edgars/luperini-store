"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  getHomePageSettingsForAdmin,
  saveHomePageSettingsValue,
} from "@/lib/store/get-home-config";
import {
  homePageSettingsSchema,
  MAX_HOME_NAV_ITEMS,
} from "@/lib/store/home-config";
import { uploadHomeHeroImage } from "@/lib/storage";
import type { ActionResult } from "@/types";

export async function saveHomeConfigAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  let navCategoryIds: string[] = [];

  try {
    const rawNav = formData.get("navCategoryIds");
    navCategoryIds = rawNav ? (JSON.parse(String(rawNav)) as string[]) : [];
  } catch {
    return { success: false, error: "Lista de categorias inválida." };
  }

  const currentSettings = await getHomePageSettingsForAdmin();
  let imageUrl = String(formData.get("heroImageUrl") ?? currentSettings.hero.imageUrl);

  const heroImage = formData.get("heroImage");
  if (heroImage instanceof File && heroImage.size > 0) {
    try {
      imageUrl = await uploadHomeHeroImage(heroImage);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a imagem do hero.",
      };
    }
  }

  const parsed = homePageSettingsSchema.safeParse({
    navCategoryIds,
    hero: {
      eyebrow: formData.get("heroEyebrow"),
      title: formData.get("heroTitle"),
      titleAccent: formData.get("heroTitleAccent"),
      description: formData.get("heroDescription"),
      ctaLabel: formData.get("heroCtaLabel"),
      ctaHref: formData.get("heroCtaHref"),
      imageUrl,
    },
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  if (parsed.data.navCategoryIds.length > MAX_HOME_NAV_ITEMS) {
    return {
      success: false,
      error: `Selecione no máximo ${MAX_HOME_NAV_ITEMS} categorias para o menu.`,
    };
  }

  try {
    await saveHomePageSettingsValue(parsed.data);
  } catch {
    return { success: false, error: "Não foi possível salvar a configuração." };
  }

  revalidatePath("/");
  revalidatePath("/admin/configuracoes/home");
  return { success: true };
}
