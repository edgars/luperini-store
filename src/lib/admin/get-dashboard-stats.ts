import { count, desc, eq, sum } from "drizzle-orm";

import { db } from "@/db";
import { orderItems, orders, users } from "@/db/schema";
import {
  getCouponAnalyticsSummary,
  getTopCoupons,
} from "@/lib/admin/coupon-stats";

export async function getDashboardStats() {
  const [
    [{ orderCount }],
    [{ userCount }],
    [{ revenueTotal }],
    recentOrders,
    topProducts,
    couponSummary,
    topCoupons,
  ] = await Promise.all([
    db.select({ orderCount: count() }).from(orders),
    db.select({ userCount: count() }).from(users),
    db
      .select({ revenueTotal: sum(orders.total) })
      .from(orders)
      .where(eq(orders.status, "paid")),
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        guestName: orders.guestName,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8),
    db
      .select({
        productName: orderItems.productName,
        sold: sum(orderItems.quantity),
        sales: sum(orderItems.total),
      })
      .from(orderItems)
      .groupBy(orderItems.productName)
      .orderBy(desc(sum(orderItems.quantity)))
      .limit(8),
    getCouponAnalyticsSummary(),
    getTopCoupons(5),
  ]);

  return {
    orderCount: Number(orderCount),
    userCount: Number(userCount),
    revenueTotal: Number(revenueTotal ?? 0),
    recentOrders,
    topProducts: topProducts.map((item) => ({
      productName: item.productName,
      sold: Number(item.sold ?? 0),
      sales: Number(item.sales ?? 0),
    })),
    couponSummary,
    topCoupons,
  };
}

export const REVENUE_CHART_DATA = [
  { month: "Jan", desktop: 4200, mobile: 3800 },
  { month: "Fev", desktop: 5100, mobile: 4300 },
  { month: "Mar", desktop: 4800, mobile: 4600 },
  { month: "Abr", desktop: 6200, mobile: 5200 },
  { month: "Mai", desktop: 5800, mobile: 5400 },
  { month: "Jun", desktop: 7100, mobile: 6100 },
] as const;

export const RETURNING_RATE_DATA = [
  { month: "Fev", current: 38, previous: 32 },
  { month: "Mar", current: 42, previous: 35 },
  { month: "Abr", current: 45, previous: 38 },
  { month: "Mai", current: 48, previous: 40 },
  { month: "Jun", current: 52, previous: 43 },
  { month: "Jul", current: 50, previous: 44 },
  { month: "Ago", current: 55, previous: 46 },
  { month: "Set", current: 58, previous: 48 },
  { month: "Out", current: 60, previous: 50 },
  { month: "Nov", current: 62, previous: 52 },
  { month: "Dez", current: 65, previous: 54 },
] as const;

export const SALES_BY_LOCATION = [
  { country: "Brasil", value: 85 },
  { country: "Portugal", value: 62 },
  { country: "EUA", value: 48 },
] as const;
