import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { productImages, products } from "@/db/schema";

export type StoreProductCard = {
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl: string | null;
  imageAlt: string | null;
};

export async function getFeaturedProducts(
  limit = 3,
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
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(limit);

  return items;
}
