import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  productImages,
  products,
  productVariants,
} from "@/db/schema";

export type StoreProductVariant = {
  id: string;
  name: string;
  salePrice: number;
  stock: number;
  attributes: Record<string, string> | null;
};

export type StoreProductImage = {
  id: string;
  url: string;
  alt: string | null;
  type: "cover" | "gallery" | "thumbnail";
  width: number | null;
  height: number | null;
};

export type StoreProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  category: { name: string; slug: string } | null;
  images: StoreProductImage[];
  variants: StoreProductVariant[];
};

export async function getProductBySlug(
  slug: string,
): Promise<StoreProductDetail | null> {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      sku: products.sku,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);

  if (!product) {
    return null;
  }

  const [variants, images] = await Promise.all([
    db
      .select({
        id: productVariants.id,
        name: productVariants.name,
        salePrice: productVariants.salePrice,
        stock: productVariants.stock,
        attributes: productVariants.attributes,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.name)),
    db
      .select({
        id: productImages.id,
        url: productImages.url,
        alt: productImages.alt,
        type: productImages.type,
        width: productImages.width,
        height: productImages.height,
        position: productImages.position,
      })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
  ]);

  const sortedImages = [...images].sort((a, b) => {
    if (a.type === "cover" && b.type !== "cover") return -1;
    if (b.type === "cover" && a.type !== "cover") return 1;
    return a.position - b.position;
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    category:
      product.categoryName && product.categorySlug
        ? { name: product.categoryName, slug: product.categorySlug }
        : null,
    images: sortedImages.map(({ id, url, alt, type, width, height }) => ({
      id,
      url,
      alt,
      type,
      width,
      height,
    })),
    variants: variants.map((variant) => ({
      ...variant,
      attributes: variant.attributes ?? null,
    })),
  };
}

export async function getActiveProductSlugs() {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.status, "active"));

  return rows.map((row) => row.slug);
}
