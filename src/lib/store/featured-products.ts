import { and, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { products } from "@/db/schema";
import { MAX_FEATURED_PRODUCTS } from "@/lib/store/constants";

export async function countFeaturedProducts(excludeProductId?: string) {
  const conditions = [eq(products.isFeatured, true)];

  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(...conditions));

  return result?.count ?? 0;
}

export async function validateFeaturedLimit(
  wantsFeatured: boolean,
  excludeProductId?: string,
): Promise<string | null> {
  if (!wantsFeatured) return null;

  const count = await countFeaturedProducts(excludeProductId);
  if (count >= MAX_FEATURED_PRODUCTS) {
    return `Máximo de ${MAX_FEATURED_PRODUCTS} produtos em destaque. Remova um destaque existente antes de adicionar outro.`;
  }

  return null;
}
