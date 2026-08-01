"use server";

import { revalidatePath } from "next/cache";

import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  getHomePageSettingsForAdmin,
  saveHomePageSettingsValue,
} from "@/lib/store/get-home-config";
import {
  createHeroSlideId,
  homePageSettingsSchema,
  MAX_HERO_SLIDES,
  MAX_HOME_NAV_ITEMS,
  type HeroSlide,
} from "@/lib/store/home-config";
import { uploadHomeHeroImage } from "@/lib/storage";
import type { ActionResult } from "@/types";

type SlidePayload = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  fileFieldName?: string | null;
};

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

  const heroMode = String(formData.get("heroMode") ?? "split") === "slider"
    ? "slider"
    : "split";

  let rawSlides: SlidePayload[] = [];
  try {
    const rawSlidesField = formData.get("heroSlides");
    rawSlides = rawSlidesField
      ? (JSON.parse(String(rawSlidesField)) as SlidePayload[])
      : [];
  } catch {
    return { success: false, error: "Dados dos slides inválidos." };
  }

  if (rawSlides.length > MAX_HERO_SLIDES) {
    return {
      success: false,
      error: `Máximo de ${MAX_HERO_SLIDES} slides no carrossel.`,
    };
  }

  const resolvedSlides: HeroSlide[] = [];
  for (const slide of rawSlides) {
    let slideImageUrl = slide.imageUrl;

    if (slide.fileFieldName) {
      const uploaded = formData.get(slide.fileFieldName);
      if (uploaded instanceof File && uploaded.size > 0) {
        try {
          slideImageUrl = await uploadHomeHeroImage(uploaded);
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Não foi possível enviar a imagem do slide.",
          };
        }
      }
    }

    if (!slideImageUrl) {
      if (heroMode === "slider") {
        return {
          success: false,
          error: "Cada slide precisa de uma imagem.",
        };
      }
      continue;
    }

    resolvedSlides.push({
      id: slide.id?.trim() || createHeroSlideId(),
      imageUrl: slideImageUrl,
      title: slide.title?.trim() ?? "",
      subtitle: slide.subtitle?.trim() ?? "",
      ctaLabel: slide.ctaLabel?.trim() ?? "",
      ctaHref: slide.ctaHref?.trim() ?? "",
    });
  }

  if (heroMode === "slider" && resolvedSlides.length === 0) {
    return {
      success: false,
      error: "Adicione ao menos um slide para o carrossel.",
    };
  }

  const parsed = homePageSettingsSchema.safeParse({
    navCategoryIds,
    hero: {
      mode: heroMode,
      eyebrow: formData.get("heroEyebrow"),
      title: formData.get("heroTitle"),
      titleAccent: formData.get("heroTitleAccent"),
      description: formData.get("heroDescription"),
      ctaLabel: formData.get("heroCtaLabel"),
      ctaHref: formData.get("heroCtaHref"),
      imageUrl,
      slides: resolvedSlides,
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
