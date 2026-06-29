import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  productImages,
  productTagAssignments,
  productTags,
  products,
} from "@/db/schema";
import type { StoreProductCard } from "@/lib/store/get-featured-products";
import { getProductCardImagesByProductIds } from "@/lib/store/product-card-images";
import {
  PRODUCT_SEASONS,
  type ProductSeason,
} from "@/lib/store/product-season";

export type StoreCategoryFilter = {
  name: string;
  slug: string;
  productCount: number;
};

export type StoreTagFilter = {
  name: string;
  slug: string;
  productCount: number;
};

export type StoreCatalogFilters = {
  categories: StoreCategoryFilter[];
  tags: StoreTagFilter[];
  seasons: { value: ProductSeason; label: string; productCount: number }[];
  priceRange: { min: number; max: number };
};

export type StoreProductsQuery = {
  q?: string;
  categorySlug?: string;
  sort?: string;
  season?: string;
  tagSlugs?: string[];
  priceMin?: number;
  priceMax?: number;
};

function parseTagSlugs(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseStoreProductsQuery(params: {
  q?: string;
  categoria?: string;
  sort?: string;
  temporada?: string;
  tags?: string;
  preco_min?: string;
  preco_max?: string;
}): StoreProductsQuery {
  const priceMin = params.preco_min ? Number(params.preco_min) : undefined;
  const priceMax = params.preco_max ? Number(params.preco_max) : undefined;

  return {
    q: params.q?.trim() || undefined,
    categorySlug: params.categoria?.trim() || undefined,
    sort: params.sort?.trim() || undefined,
    season: params.temporada?.trim() || undefined,
    tagSlugs: parseTagSlugs(params.tags),
    priceMin:
      priceMin !== undefined && Number.isFinite(priceMin) && priceMin >= 0
        ? Math.round(priceMin * 100)
        : undefined,
    priceMax:
      priceMax !== undefined && Number.isFinite(priceMax) && priceMax >= 0
        ? Math.round(priceMax * 100)
        : undefined,
  };
}

function resolveOrderBy(sort?: string) {
  switch (sort) {
    case "novidades":
      return [desc(products.createdAt), asc(products.name)];
    case "lookbook":
      return [
        desc(products.isFeatured),
        desc(products.updatedAt),
        asc(products.name),
      ];
    case "preco_asc":
      return [asc(products.salePrice), asc(products.name)];
    case "preco_desc":
      return [desc(products.salePrice), asc(products.name)];
    default:
      return [asc(products.name)];
  }
}

function buildSearchCondition(query: string) {
  const pattern = `%${query.toLowerCase()}%`;

  return or(
    ilike(products.name, pattern),
    ilike(products.description, pattern),
    ilike(products.sku, pattern),
    sql`${products.id} in (
      select ${productTagAssignments.productId}
      from ${productTagAssignments}
      inner join ${productTags} on ${productTags.id} = ${productTagAssignments.tagId}
      where lower(${productTags.name}) like ${pattern}
         or lower(${productTags.slug}) like ${pattern}
    )`,
  );
}

function buildTagCondition(tagSlugs: string[]) {
  return sql`${products.id} in (
    select ${productTagAssignments.productId}
    from ${productTagAssignments}
    inner join ${productTags} on ${productTags.id} = ${productTagAssignments.tagId}
    where ${inArray(productTags.slug, tagSlugs)}
  )`;
}

function buildConditions(query: StoreProductsQuery) {
  const conditions = [eq(products.status, "active")];

  if (query.categorySlug) {
    conditions.push(eq(categories.slug, query.categorySlug));
  }

  if (query.q) {
    const searchCondition = buildSearchCondition(query.q);
    if (searchCondition) conditions.push(searchCondition);
  }

  if (query.season && query.season !== "all") {
    conditions.push(
      eq(
        products.season,
        query.season as (typeof products.season.enumValues)[number],
      ),
    );
  }

  if (query.tagSlugs && query.tagSlugs.length > 0) {
    conditions.push(buildTagCondition(query.tagSlugs));
  }

  if (query.priceMin !== undefined) {
    conditions.push(gte(products.salePrice, query.priceMin));
  }

  if (query.priceMax !== undefined) {
    conditions.push(lte(products.salePrice, query.priceMax));
  }

  return conditions;
}

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

export async function getStoreTagFilters(): Promise<StoreTagFilter[]> {
  const rows = await db
    .select({
      name: productTags.name,
      slug: productTags.slug,
      productCount: sql<number>`count(distinct ${products.id})::int`,
    })
    .from(productTags)
    .innerJoin(
      productTagAssignments,
      eq(productTagAssignments.tagId, productTags.id),
    )
    .innerJoin(products, eq(products.id, productTagAssignments.productId))
    .where(eq(products.status, "active"))
    .groupBy(productTags.id, productTags.name, productTags.slug)
    .orderBy(asc(productTags.name));

  return rows;
}

export async function getStoreCatalogFilters(): Promise<StoreCatalogFilters> {
  const [categoriesList, tags, priceRow, seasonCounts] = await Promise.all([
    getStoreCategoryFilters(),
    getStoreTagFilters(),
    db
      .select({
        min: sql<number>`coalesce(min(${products.salePrice}), 0)::int`,
        max: sql<number>`coalesce(max(${products.salePrice}), 0)::int`,
      })
      .from(products)
      .where(eq(products.status, "active")),
    db
      .select({
        season: products.season,
        productCount: sql<number>`count(${products.id})::int`,
      })
      .from(products)
      .where(eq(products.status, "active"))
      .groupBy(products.season),
  ]);

  const seasonCountMap = new Map(
    seasonCounts.map((row) => [row.season, row.productCount]),
  );

  return {
    categories: categoriesList,
    tags,
    seasons: PRODUCT_SEASONS.map((season) => ({
      value: season.value,
      label: season.label,
      productCount: seasonCountMap.get(season.value) ?? 0,
    })).filter((season) => season.productCount > 0),
    priceRange: {
      min: priceRow[0]?.min ?? 0,
      max: priceRow[0]?.max ?? 0,
    },
  };
}

export async function getStoreProducts(query: StoreProductsQuery = {}): Promise<{
  products: StoreProductCard[];
  activeCategory: { name: string; slug: string } | null;
  total: number;
}> {
  const conditions = buildConditions(query);
  const orderBy = resolveOrderBy(query.sort);

  const rows = await db
    .select({
      id: products.id,
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

  const { categorySlug } = query;
  const activeCategory =
    categorySlug && rows.length > 0 && rows[0].categorySlug
      ? { name: rows[0].categoryName!, slug: rows[0].categorySlug! }
      : categorySlug
        ? await getCategoryBySlug(categorySlug)
        : null;

  const uniqueProducts = dedupeProductRows(rows);
  const imagesByProductId = await getProductCardImagesByProductIds(
    uniqueProducts.map((product) => product.id),
  );

  return {
    products: uniqueProducts.map(
      ({ id, name, slug, priceInCents, imageUrl, imageAlt }) => {
        const images = imagesByProductId.get(id) ?? [];
        const primary =
          images[0] ?? (imageUrl ? { url: imageUrl, alt: imageAlt } : null);

        return {
          name,
          slug,
          priceInCents,
          imageUrl: primary?.url ?? null,
          imageAlt: primary?.alt ?? null,
          images: images.length > 0 ? images : primary ? [primary] : [],
        };
      },
    ),
    activeCategory,
    total: uniqueProducts.length,
  };
}

function dedupeProductRows<
  T extends { slug: string; imageUrl: string | null },
>(rows: T[]) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const row of rows) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    result.push(row);
  }

  return result;
}

async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select({ name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return category ?? null;
}
