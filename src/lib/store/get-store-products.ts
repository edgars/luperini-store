import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";
import type { StoreProductCard } from "@/lib/store/get-featured-products";

export type StoreCategoryFilter = {
  name: string;
  slug: string;
  productCount: number;
};

export type StoreProductsQuery = {
  categorySlug?: string;
  sort?: string;
};

export async function getStoreCategoryFilters(): Promise<StoreCategoryFilter[]> {
  const rows = await db
    .select({
      name: categories.name,
      slug: categories.slug,
      productCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .innerJoin(products, eq(products.categoryId, categories.id))
    .where(eq(products.status, "active"))
    .groupBy(categories.id, categories.name, categories.slug)
    .orderBy(asc(categories.name));

  return rows;
}

function resolveOrderBy(sort?: string) {
  switch (sort) {
    case "novidades":
      return [desc(products.createdAt), asc(products.name)];
    case "lookbook":
      return [desc(products.isFeatured), desc(products.updatedAt), asc(products.name)];
    default:
      return [asc(products.name)];
  }
}

export async function getStoreProducts(
  query: StoreProductsQuery = {},
): Promise<{
  products: StoreProductCard[];
  activeCategory: { name: string; slug: string } | null;
}> {
  const { categorySlug, sort } = query;
  const conditions = [eq(products.status, "active")];

  if (categorySlug) {
    conditions.push(eq(categories.slug, categorySlug));
  }

  const orderBy = resolveOrderBy(sort);

  const rows = await db
    .select({
      name: products.name,
      slug: products.slug,
      priceInCents: products.salePrice,
      imageUrl: productImages.url,
      imageAlt: productImages.alt,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.type, "cover"),
      ),
    )
    .where(and(...conditions))
    .orderBy(...orderBy);

  const activeCategory =
    categorySlug && rows.length > 0 && rows[0].categorySlug
      ? { name: rows[0].categoryName!, slug: rows[0].categorySlug! }
      : categorySlug
        ? await getCategoryBySlug(categorySlug)
        : null;

  return {
    products: rows.map(({ name, slug, priceInCents, imageUrl, imageAlt }) => ({
      name,
      slug,
      priceInCents,
      imageUrl,
      imageAlt,
    })),
    activeCategory,
  };
}

async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return category ?? null;
}
