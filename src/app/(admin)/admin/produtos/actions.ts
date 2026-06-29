"use server";

import { and, eq, inArray, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  calculateMargin,
  productImages,
  productSocialEmbeds,
  products,
  productVariants,
  supplierPurchases,
} from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import {
  parseSocialVideoUrl,
  type SocialPlatform,
} from "@/lib/social-video-links";
import { parseReaisToCents } from "@/lib/prices";
import { validateFeaturedLimit } from "@/lib/store/featured-products";
import { PRODUCT_SEASONS, type ProductSeason } from "@/lib/store/product-season";
import {
  removeProductImageFiles,
  uploadProductImage,
} from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

import { syncProductTags } from "./tags/actions";

const seasonValues = PRODUCT_SEASONS.map((item) => item.value) as [
  ProductSeason,
  ...ProductSeason[],
];

const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  costPrice: z.string().min(1, "Informe o preço de custo"),
  salePrice: z.string().min(1, "Informe o preço de venda"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]),
  stock: z.string().optional(),
  isFeatured: z.boolean(),
  purchaseSource: z.enum(["supplier", "in_house"]),
  supplierId: z.string().uuid().optional().or(z.literal("")),
  season: z.enum(seasonValues),
  fakeOrderCount: z.string().optional(),
});

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    costPrice: formData.get("costPrice"),
    salePrice: formData.get("salePrice"),
    sku: formData.get("sku") || undefined,
    barcode: formData.get("barcode") || undefined,
    status: formData.get("status"),
    stock: formData.get("stock") || undefined,
    isFeatured: formData.get("isFeatured") === "on",
    purchaseSource: formData.get("purchaseSource"),
    supplierId: formData.get("supplierId") || undefined,
    season: formData.get("season"),
    fakeOrderCount: formData.get("fakeOrderCount") ?? "",
  });
}

function parseTagIds(formData: FormData) {
  return formData
    .getAll("tagIds")
    .map((value) => String(value))
    .filter((value) => value.length > 0);
}

type ParsedPrices =
  | { error: string }
  | { costPrice: number; salePrice: number; margin: number };

function parsePrices(data: {
  costPrice: string;
  salePrice: string;
}): ParsedPrices {
  const costPrice = parseReaisToCents(data.costPrice);
  const salePrice = parseReaisToCents(data.salePrice);

  if (costPrice === null) {
    return { error: "Preço de custo inválido" as const };
  }

  if (salePrice === null) {
    return { error: "Preço de venda inválido" as const };
  }

  if (salePrice <= 0) {
    return { error: "O preço de venda deve ser maior que zero" as const };
  }

  return {
    costPrice,
    salePrice,
    margin: calculateMargin(salePrice, costPrice),
  };
}

function parseFakeOrderCount(raw: string | undefined): number | { error: string } {
  const value = raw?.trim() ?? "";

  if (!value) {
    return 0;
  }

  const count = Number(value);
  if (!Number.isFinite(count) || !Number.isInteger(count) || count < 0) {
    return { error: "Informe uma quantidade de compras válida (número inteiro ≥ 0)." };
  }

  return count;
}

function resolvePurchaseFields(data: {
  purchaseSource: "supplier" | "in_house";
  supplierId?: string;
}):
  | { error: string }
  | {
      purchaseSource: "supplier" | "in_house";
      supplierId: string | null;
    } {
  if (data.purchaseSource === "supplier") {
    if (!data.supplierId) {
      return { error: "Selecione o fornecedor da compra." };
    }

    return {
      purchaseSource: "supplier",
      supplierId: data.supplierId,
    };
  }

  return {
    purchaseSource: "in_house",
    supplierId: null,
  };
}

function getGalleryFiles(formData: FormData) {
  return formData
    .getAll("galleryImages")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

async function getNextGalleryPosition(productId: string) {
  const [result] = await db
    .select({ maxPosition: max(productImages.position) })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  return (result?.maxPosition ?? -1) + 1;
}

async function uploadGalleryImages(
  productId: string,
  formData: FormData,
  alt: string,
) {
  const files = getGalleryFiles(formData);
  if (files.length === 0) return;

  let position = await getNextGalleryPosition(productId);

  for (const file of files) {
    const uploaded = await uploadProductImage(productId, file, "gallery");
    await db.insert(productImages).values({
      productId,
      url: uploaded.url,
      originalUrl: uploaded.originalUrl,
      alt,
      type: "gallery",
      position,
      width: uploaded.width,
      height: uploaded.height,
      originalWidth: uploaded.originalWidth,
      originalHeight: uploaded.originalHeight,
    });
    position += 1;
  }
}

function parseSocialLinksJson(formData: FormData) {
  const raw = formData.get("socialLinksJson");
  const links: { id?: string; url: string; platform: SocialPlatform }[] = [];

  if (typeof raw === "string" && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;

          const url = "url" in item ? String(item.url) : "";
          const parsedLink = parseSocialVideoUrl(url);
          if (!parsedLink) continue;

          const id =
            "id" in item && typeof item.id === "string" && item.id.length > 0
              ? item.id
              : undefined;

          links.push({
            id,
            url: parsedLink.url,
            platform: parsedLink.platform,
          });
        }
      }
    } catch {
      // fall through to draft url
    }
  }

  if (links.length === 0) {
    const draft = formData.get("socialDraftUrl");
    if (typeof draft === "string" && draft.trim()) {
      const parsedLink = parseSocialVideoUrl(draft);
      if (parsedLink) {
        links.push({
          url: parsedLink.url,
          platform: parsedLink.platform,
        });
      }
    }
  }

  return links;
}

async function syncProductSocialLinks(
  productId: string,
  formData: FormData,
) {
  const submitted = parseSocialLinksJson(formData);
  const existing = await db
    .select({
      id: productSocialEmbeds.id,
      url: productSocialEmbeds.url,
    })
    .from(productSocialEmbeds)
    .where(eq(productSocialEmbeds.productId, productId));

  const existingByUrl = new Map(existing.map((row) => [row.url, row.id]));

  const submittedIds = new Set(
    submitted.map((link) => link.id).filter((id): id is string => Boolean(id)),
  );

  const idsToDelete = existing
    .map((row) => row.id)
    .filter((id) => !submittedIds.has(id));

  if (idsToDelete.length > 0) {
    await db
      .delete(productSocialEmbeds)
      .where(
        and(
          eq(productSocialEmbeds.productId, productId),
          inArray(productSocialEmbeds.id, idsToDelete),
        ),
      );
  }

  for (const [position, link] of submitted.entries()) {
    const existingId = link.id ?? existingByUrl.get(link.url);

    if (existingId) {
      await db
        .update(productSocialEmbeds)
        .set({
          url: link.url,
          platform: link.platform,
          position,
        })
        .where(eq(productSocialEmbeds.id, existingId));
    } else {
      await db.insert(productSocialEmbeds).values({
        productId,
        url: link.url,
        platform: link.platform,
        position,
      });
    }
  }
}

export async function createProductAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const prices = parsePrices(parsed.data);
  if ("error" in prices) {
    return { success: false, error: prices.error };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const stock = parsed.data.stock ? Number(parsed.data.stock) : 0;

  const featuredError = await validateFeaturedLimit(parsed.data.isFeatured);
  if (featuredError) {
    return { success: false, error: featuredError };
  }

  const purchaseFields = resolvePurchaseFields(parsed.data);
  if ("error" in purchaseFields) {
    return { success: false, error: purchaseFields.error };
  }

  const fakeOrderCount = parseFakeOrderCount(parsed.data.fakeOrderCount);
  if (typeof fakeOrderCount !== "number") {
    return { success: false, error: fakeOrderCount.error };
  }

  let productId: string;

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        categoryId: parsed.data.categoryId || null,
        costPrice: prices.costPrice,
        salePrice: prices.salePrice,
        margin: prices.margin,
        sku: parsed.data.sku?.trim() || null,
        barcode: parsed.data.barcode?.trim() || null,
        status: parsed.data.status,
        isFeatured: parsed.data.isFeatured,
        purchaseSource: purchaseFields.purchaseSource,
        supplierId: purchaseFields.supplierId,
        season: parsed.data.season,
        fakeOrderCount,
      })
      .returning({ id: products.id });

    productId = product.id;

    await syncProductTags(productId, parseTagIds(formData));

    await db.insert(productVariants).values({
      productId,
      name: "Padrão",
      costPrice: prices.costPrice,
      salePrice: prices.salePrice,
      stock: Number.isFinite(stock) && stock >= 0 ? stock : 0,
    });

    const normalizedStock =
      Number.isFinite(stock) && stock >= 0 ? stock : 0;

    if (normalizedStock > 0) {
      await db.insert(supplierPurchases).values({
        supplierId: purchaseFields.supplierId,
        productId,
        source: purchaseFields.purchaseSource,
        quantity: normalizedStock,
        unitCost: prices.costPrice,
        totalCost: prices.costPrice * normalizedStock,
        notes:
          purchaseFields.purchaseSource === "in_house"
            ? "Entrada inicial — fabricação própria"
            : "Compra inicial no cadastro do produto",
      });
    }
  } catch {
    return { success: false, error: "Não foi possível criar o produto." };
  }

  const coverFile = formData.get("coverImage");
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      const uploaded = await uploadProductImage(productId, coverFile, "cover");
      await db.insert(productImages).values({
        productId,
        url: uploaded.url,
        originalUrl: uploaded.originalUrl,
        alt: parsed.data.name.trim(),
        type: "cover",
        position: 0,
        width: uploaded.width,
        height: uploaded.height,
        originalWidth: uploaded.originalWidth,
        originalHeight: uploaded.originalHeight,
      });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Produto criado, mas falha ao enviar a imagem de capa.",
      };
    }
  }

  try {
    await uploadGalleryImages(productId, formData, parsed.data.name.trim());
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Produto criado, mas falha ao enviar fotos adicionais.",
    };
  }

  try {
    await syncProductSocialLinks(productId, formData);
  } catch {
    return {
      success: false,
      error: "Produto criado, mas falha ao salvar links de Instagram/TikTok.",
    };
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/fornecedores");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${slug}`);
  redirect(`/admin/produtos/${productId}`);
}

export async function updateProductAction(
  id: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const prices = parsePrices(parsed.data);
  if ("error" in prices) {
    return { success: false, error: prices.error };
  }

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const stock = parsed.data.stock ? Number(parsed.data.stock) : 0;

  const featuredError = await validateFeaturedLimit(parsed.data.isFeatured, id);
  if (featuredError) {
    return { success: false, error: featuredError };
  }

  const purchaseFields = resolvePurchaseFields(parsed.data);
  if ("error" in purchaseFields) {
    return { success: false, error: purchaseFields.error };
  }

  const fakeOrderCount = parseFakeOrderCount(parsed.data.fakeOrderCount);
  if (typeof fakeOrderCount !== "number") {
    return { success: false, error: fakeOrderCount.error };
  }

  try {
    await db
      .update(products)
      .set({
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        categoryId: parsed.data.categoryId || null,
        costPrice: prices.costPrice,
        salePrice: prices.salePrice,
        margin: prices.margin,
        sku: parsed.data.sku?.trim() || null,
        barcode: parsed.data.barcode?.trim() || null,
        status: parsed.data.status,
        isFeatured: parsed.data.isFeatured,
        purchaseSource: purchaseFields.purchaseSource,
        supplierId: purchaseFields.supplierId,
        season: parsed.data.season,
        fakeOrderCount,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    await syncProductTags(id, parseTagIds(formData));

    const [variant] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id))
      .limit(1);

    if (variant) {
      await db
        .update(productVariants)
        .set({
          costPrice: prices.costPrice,
          salePrice: prices.salePrice,
          stock: Number.isFinite(stock) && stock >= 0 ? stock : variant.stock,
        })
        .where(eq(productVariants.id, variant.id));
    }
  } catch {
    return { success: false, error: "Não foi possível atualizar o produto." };
  }

  const coverFile = formData.get("coverImage");
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      const uploaded = await uploadProductImage(id, coverFile, "cover");

      const [existingCover] = await db
        .select()
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, id),
            eq(productImages.type, "cover"),
          ),
        )
        .limit(1);

      if (existingCover) {
        await removeProductImageFiles(existingCover);

        await db
          .update(productImages)
          .set({
            url: uploaded.url,
            originalUrl: uploaded.originalUrl,
            width: uploaded.width,
            height: uploaded.height,
            originalWidth: uploaded.originalWidth,
            originalHeight: uploaded.originalHeight,
          })
          .where(eq(productImages.id, existingCover.id));
      } else {
        await db.insert(productImages).values({
          productId: id,
          url: uploaded.url,
          originalUrl: uploaded.originalUrl,
          alt: parsed.data.name.trim(),
          type: "cover",
          position: 0,
          width: uploaded.width,
          height: uploaded.height,
          originalWidth: uploaded.originalWidth,
          originalHeight: uploaded.originalHeight,
        });
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Produto atualizado, mas falha ao enviar a imagem.",
      };
    }
  }

  try {
    await uploadGalleryImages(id, formData, parsed.data.name.trim());
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Produto atualizado, mas falha ao enviar fotos adicionais.",
    };
  }

  try {
    await syncProductSocialLinks(id, formData);
  } catch {
    return {
      success: false,
      error: "Produto atualizado, mas falha ao salvar links de Instagram/TikTok.",
    };
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/admin/fornecedores");
  revalidatePath("/");
  revalidatePath("/produtos");
  revalidatePath(`/produtos/${slug}`);
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    await db.delete(products).where(eq(products.id, id));

    for (const image of images) {
      await removeProductImageFiles(image);
    }
  } catch {
    return { success: false, error: "Não foi possível excluir o produto." };
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProductGalleryImageAction(
  imageId: string,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  try {
    const [image] = await db
      .select()
      .from(productImages)
      .where(
        and(eq(productImages.id, imageId), eq(productImages.type, "gallery")),
      )
      .limit(1);

    if (!image) {
      return { success: false, error: "Imagem não encontrada." };
    }

    await db.delete(productImages).where(eq(productImages.id, imageId));
    await removeProductImageFiles(image);

    revalidatePath("/admin/produtos");
    revalidatePath(`/admin/produtos/${image.productId}`);
    revalidatePath("/");
    revalidatePath("/produtos");
    return { success: true };
  } catch {
    return { success: false, error: "Não foi possível remover a imagem." };
  }
}

export async function toggleProductStatusAction(
  productId: string,
  makeActive: boolean,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const status = makeActive ? "active" : "draft";

  try {
    const [updated] = await db
      .update(products)
      .set({ status, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning({ slug: products.slug });

    if (!updated) {
      return { success: false, error: "Produto não encontrado." };
    }

    revalidatePath("/admin/produtos");
    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath("/");
    revalidatePath("/produtos");
    if (updated.slug) revalidatePath(`/produtos/${updated.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Não foi possível atualizar o status." };
  }
}

export async function toggleProductFeaturedAction(
  productId: string,
  makeFeatured: boolean,
): Promise<ActionResult> {
  const denied = await assertAdminAction();
  if (denied) return denied;

  const featuredError = await validateFeaturedLimit(makeFeatured, productId);
  if (featuredError) {
    return { success: false, error: featuredError };
  }

  try {
    const [updated] = await db
      .update(products)
      .set({ isFeatured: makeFeatured, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning({ slug: products.slug });

    if (!updated) {
      return { success: false, error: "Produto não encontrado." };
    }

    revalidatePath("/admin/produtos");
    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath("/");
    revalidatePath("/produtos");
    if (updated.slug) revalidatePath(`/produtos/${updated.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Não foi possível atualizar o destaque." };
  }
}
