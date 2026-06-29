import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { productImages, products } from "@/db/schema";
import { MAX_FEATURED_PRODUCTS } from "@/lib/store/constants";
import {
  getProductCardImagesByProductIds,
  type StoreProductCardImage,
} from "@/lib/store/product-card-images";

export type { StoreProductCardImage };

export type StoreProductCard = {
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl: string | null;
  imageAlt: string | null;
  images: StoreProductCardImage[];
};

export async function getFeaturedProducts(
  limit = MAX_FEATURED_PRODUCTS,
): Promise<StoreProductCard[]> {
  const items = await db
    .select({
      id: products.id,
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

  const imagesByProductId = await getProductCardImagesByProductIds(
    items.map((item) => item.id),
  );

  return items.map(({ id, name, slug, priceInCents, imageUrl, imageAlt }) => {
    const images = imagesByProductId.get(id) ?? [];
    const primary = images[0] ?? (imageUrl ? { url: imageUrl, alt: imageAlt } : null);

    return {
      name,
      slug,
      priceInCents,
      imageUrl: primary?.url ?? null,
      imageAlt: primary?.alt ?? null,
      images: images.length > 0 ? images : primary ? [primary] : [],
    };
  });
}
