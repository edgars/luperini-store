import { asc, inArray } from "drizzle-orm";

import { db } from "@/db";
import { productImages } from "@/db/schema";

export type StoreProductCardImage = {
  url: string;
  alt: string | null;
};

type ImageRow = StoreProductCardImage & {
  type: "cover" | "gallery" | "thumbnail";
  position: number;
};

export async function getProductCardImagesByProductIds(
  productIds: string[],
): Promise<Map<string, StoreProductCardImage[]>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const rows = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      alt: productImages.alt,
      type: productImages.type,
      position: productImages.position,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.position));

  const grouped = new Map<string, ImageRow[]>();

  for (const row of rows) {
    const list = grouped.get(row.productId) ?? [];
    list.push({
      url: row.url,
      alt: row.alt,
      type: row.type,
      position: row.position,
    });
    grouped.set(row.productId, list);
  }

  const result = new Map<string, StoreProductCardImage[]>();

  for (const [productId, images] of grouped) {
    const sorted = [...images].sort((a, b) => {
      if (a.type === "cover" && b.type !== "cover") return -1;
      if (b.type === "cover" && a.type !== "cover") return 1;
      return a.position - b.position;
    });

    result.set(
      productId,
      sorted.map(({ url, alt }) => ({ url, alt })),
    );
  }

  return result;
}
