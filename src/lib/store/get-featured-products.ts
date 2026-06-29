import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { MAX_FEATURED_PRODUCTS } from "@/lib/store/constants";

export type StoreProductCard = {
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl: string | null;
  imageAlt: string | null;
};

export async function getFeaturedProducts(
  limit = MAX_FEATURED_PRODUCTS,
): Promise<StoreProductCard[]> {
  const items = await db
    .select({
      name: products.name,
      slug: products.slug,
      priceInCents: products.salePrice,
      imageUrl: productImages.url,
      imageAlt: productImages.alt,
    })
    .from(products)
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.type, "cover"),
      ),
    )
    .where(and(eq(products.status, "active"), eq(products.isFeatured, true)))
    .orderBy(desc(products.updatedAt), asc(products.name))
    .limit(Math.min(limit, MAX_FEATURED_PRODUCTS));

  return items;
}
