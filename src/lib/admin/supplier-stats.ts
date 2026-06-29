import { eq, sql } from "drizzle-orm";

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
