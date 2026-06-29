import { eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, supplierPurchases, suppliers } from "@/db/schema";

export type SupplierListItem = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  isActive: boolean;
  productCount: number;
  purchaseCount: number;
  totalPurchased: number;
  averageMargin: number | null;
};

export async function getSuppliersWithStats(): Promise<SupplierListItem[]> {
  const rows = await db
    .select({
      id: suppliers.id,
      name: suppliers.name,
      contactName: suppliers.contactName,
      phone: suppliers.phone,
      isActive: suppliers.isActive,
      productCount: sql<number>`count(distinct ${products.id})::int`,
      purchaseCount: sql<number>`count(distinct ${supplierPurchases.id})::int`,
      totalPurchased: sql<number>`coalesce(sum(${supplierPurchases.totalCost}), 0)::int`,
      averageMargin: sql<number | null>`round(avg(${products.margin}))::int`,
    })
    .from(suppliers)
    .leftJoin(products, eq(products.supplierId, suppliers.id))
    .leftJoin(supplierPurchases, eq(supplierPurchases.supplierId, suppliers.id))
    .groupBy(suppliers.id)
    .orderBy(suppliers.name);

  return rows;
}

export type SupplierDetailStats = {
  productCount: number;
  purchaseCount: number;
  totalPurchased: number;
  averageMargin: number | null;
};

export async function getSupplierDetailStats(
  supplierId: string,
): Promise<SupplierDetailStats> {
  const [stats] = await db
    .select({
      productCount: sql<number>`count(distinct ${products.id})::int`,
      purchaseCount: sql<number>`count(distinct ${supplierPurchases.id})::int`,
      totalPurchased: sql<number>`coalesce(sum(${supplierPurchases.totalCost}), 0)::int`,
      averageMargin: sql<number | null>`round(avg(${products.margin}))::int`,
    })
    .from(suppliers)
    .leftJoin(products, eq(products.supplierId, suppliers.id))
    .leftJoin(supplierPurchases, eq(supplierPurchases.supplierId, suppliers.id))
    .where(eq(suppliers.id, supplierId))
    .groupBy(suppliers.id);

  return (
    stats ?? {
      productCount: 0,
      purchaseCount: 0,
      totalPurchased: 0,
      averageMargin: null,
    }
  );
}

export type SupplierLinkedProduct = {
  supplierId: string;
  id: string;
  name: string;
  salePrice: number;
  margin: number;
  status: string;
  purchaseCount: number;
  totalPurchased: number;
};

export async function getSupplierLinkedProducts(): Promise<
  SupplierLinkedProduct[]
> {
  const rows = await db
    .select({
      supplierId: products.supplierId,
      id: products.id,
      name: products.name,
      salePrice: products.salePrice,
      margin: products.margin,
      status: products.status,
      purchaseCount: sql<number>`count(${supplierPurchases.id})::int`,
      totalPurchased: sql<number>`coalesce(sum(${supplierPurchases.totalCost}), 0)::int`,
    })
    .from(products)
    .leftJoin(
      supplierPurchases,
      eq(supplierPurchases.productId, products.id),
    )
    .where(isNotNull(products.supplierId))
    .groupBy(products.id)
    .orderBy(products.name);

  return rows.flatMap((row) =>
    row.supplierId
      ? [
          {
            supplierId: row.supplierId,
            id: row.id,
            name: row.name,
            salePrice: row.salePrice,
            margin: row.margin,
            status: row.status,
            purchaseCount: row.purchaseCount,
            totalPurchased: row.totalPurchased,
          },
        ]
      : [],
  );
}

export function groupProductsBySupplier(
  products: SupplierLinkedProduct[],
): Record<string, SupplierLinkedProduct[]> {
  return products.reduce<Record<string, SupplierLinkedProduct[]>>(
    (accumulator, product) => {
      if (!product.supplierId) return accumulator;
      if (!accumulator[product.supplierId]) {
        accumulator[product.supplierId] = [];
      }
      accumulator[product.supplierId].push(product);
      return accumulator;
    },
    {},
  );
}
