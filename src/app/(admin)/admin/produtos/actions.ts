"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  calculateMargin,
  productImages,
  products,
  productVariants,
  supplierPurchases,
} from "@/db/schema";
import { assertAdminAction } from "@/lib/admin/assert-admin";
import { parseReaisToCents } from "@/lib/prices";
import { validateFeaturedLimit } from "@/lib/store/featured-products";
import {
  removeProductImageFiles,
  uploadProductImage,
} from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

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
  });
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
      })
      .returning({ id: products.id });

    productId = product.id;

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

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/fornecedores");
  revalidatePath("/");
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
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

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

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath("/admin/fornecedores");
  revalidatePath("/");
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
