import { count, desc, eq, inArray, isNotNull, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { couponPartners, coupons, orders } from "@/db/schema";
import { getCouponStatus } from "@/lib/store/coupon-utils";

export type CouponUsageByOrder = {
  orderId: string;
  orderNumber: string;
  guestName: string | null;
  discount: number;
  total: number;
  status: string;
  createdAt: Date;
};

export type CouponListItem = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: Date | null;
  validUntil: Date | null;
  partnerId: string | null;
  partnerName: string | null;
  partnerHandle: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  orderCount: number;
  totalDiscount: number;
  totalRevenue: number;
  status: ReturnType<typeof getCouponStatus>;
};

export type CouponAnalyticsSummary = {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  totalDiscountGiven: number;
  partnerCount: number;
};

export type TopCouponStat = {
  id: string;
  code: string;
  partnerName: string | null;
  orderCount: number;
  totalDiscount: number;
};

export async function getCouponAnalyticsSummary(): Promise<CouponAnalyticsSummary> {
  const [couponRows, partnerRows, usageRows] = await Promise.all([
    db.select().from(coupons),
    db.select({ count: count() }).from(couponPartners),
    db
      .select({
        totalUses: count(orders.id),
        totalDiscountGiven: sum(orders.discount),
      })
      .from(orders)
      .where(isNotNull(orders.couponId)),
  ]);

  const now = new Date();
  const activeCoupons = couponRows.filter(
    (coupon) => getCouponStatus(coupon, now) === "active",
  ).length;

  return {
    totalCoupons: couponRows.length,
    activeCoupons,
    totalUses: Number(usageRows[0]?.totalUses ?? 0),
    totalDiscountGiven: Number(usageRows[0]?.totalDiscountGiven ?? 0),
    partnerCount: Number(partnerRows[0]?.count ?? 0),
  };
}

export async function getCouponsWithStats(): Promise<CouponListItem[]> {
  const rows = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      type: coupons.type,
      value: coupons.value,
      minOrderValue: coupons.minOrderValue,
      maxUses: coupons.maxUses,
      usedCount: coupons.usedCount,
      validFrom: coupons.validFrom,
      validUntil: coupons.validUntil,
      partnerId: coupons.partnerId,
      partnerName: couponPartners.name,
      partnerHandle: couponPartners.handle,
      description: coupons.description,
      isActive: coupons.isActive,
      createdAt: coupons.createdAt,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalDiscount: sql<number>`coalesce(sum(${orders.discount}), 0)::int`,
      totalRevenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
    })
    .from(coupons)
    .leftJoin(couponPartners, eq(couponPartners.id, coupons.partnerId))
    .leftJoin(orders, eq(orders.couponId, coupons.id))
    .groupBy(
      coupons.id,
      couponPartners.id,
      couponPartners.name,
      couponPartners.handle,
    )
    .orderBy(desc(coupons.createdAt));

  const now = new Date();

  return rows.map((row) => ({
    ...row,
    orderCount: row.orderCount ?? 0,
    totalDiscount: row.totalDiscount ?? 0,
    totalRevenue: row.totalRevenue ?? 0,
    status: getCouponStatus(row, now),
  }));
}

export async function getTopCoupons(limit = 5): Promise<TopCouponStat[]> {
  const rows = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      partnerName: couponPartners.name,
      orderCount: sql<number>`count(${orders.id})::int`,
      totalDiscount: sql<number>`coalesce(sum(${orders.discount}), 0)::int`,
    })
    .from(coupons)
    .leftJoin(couponPartners, eq(couponPartners.id, coupons.partnerId))
    .innerJoin(orders, eq(orders.couponId, coupons.id))
    .groupBy(coupons.id, couponPartners.name)
    .orderBy(desc(sql`count(${orders.id})`))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    partnerName: row.partnerName,
    orderCount: row.orderCount ?? 0,
    totalDiscount: row.totalDiscount ?? 0,
  }));
}

export async function getCouponDetailStats(couponId: string) {
  const [coupon] = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      type: coupons.type,
      value: coupons.value,
      minOrderValue: coupons.minOrderValue,
      maxUses: coupons.maxUses,
      usedCount: coupons.usedCount,
      validFrom: coupons.validFrom,
      validUntil: coupons.validUntil,
      partnerId: coupons.partnerId,
      partnerName: couponPartners.name,
      partnerHandle: couponPartners.handle,
      description: coupons.description,
      isActive: coupons.isActive,
      createdAt: coupons.createdAt,
      updatedAt: coupons.updatedAt,
    })
    .from(coupons)
    .leftJoin(couponPartners, eq(couponPartners.id, coupons.partnerId))
    .where(eq(coupons.id, couponId))
    .limit(1);

  if (!coupon) return null;

  const [usageSummary, recentOrders] = await Promise.all([
    db
      .select({
        orderCount: count(orders.id),
        totalDiscount: sum(orders.discount),
        totalRevenue: sum(orders.total),
      })
      .from(orders)
      .where(eq(orders.couponId, couponId)),
    db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        guestName: orders.guestName,
        discount: orders.discount,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.couponId, couponId))
      .orderBy(desc(orders.createdAt))
      .limit(20),
  ]);

  return {
    coupon: {
      ...coupon,
      status: getCouponStatus(coupon),
    },
    orderCount: Number(usageSummary[0]?.orderCount ?? 0),
    totalDiscount: Number(usageSummary[0]?.totalDiscount ?? 0),
    totalRevenue: Number(usageSummary[0]?.totalRevenue ?? 0),
    recentOrders: recentOrders as CouponUsageByOrder[],
  };
}

export async function getPartnerCouponStats(partnerIds: string[]) {
  if (partnerIds.length === 0) return new Map<string, number>();

  const rows = await db
    .select({
      partnerId: coupons.partnerId,
      couponCount: count(coupons.id),
    })
    .from(coupons)
    .where(inArray(coupons.partnerId, partnerIds))
    .groupBy(coupons.partnerId);

  return new Map(
    rows
      .filter((row) => row.partnerId)
      .map((row) => [row.partnerId!, Number(row.couponCount)]),
  );
}
