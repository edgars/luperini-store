import Link from "next/link";
import { asc } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CouponAnalyticsCards } from "@/components/admin/coupon-analytics-cards";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponStatusBadge } from "@/components/admin/coupon-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { couponPartners } from "@/db/schema";
import {
  getCouponAnalyticsSummary,
  getCouponsWithStats,
} from "@/lib/admin/coupon-stats";
import { requireAdmin } from "@/lib/auth";
import {
  formatCouponCode,
  formatCouponValue,
} from "@/lib/store/coupon-utils";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  await requireAdmin();

  const [summary, items, partners] = await Promise.all([
    getCouponAnalyticsSummary(),
    getCouponsWithStats(),
    db.select().from(couponPartners).orderBy(asc(couponPartners.name)),
  ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Cupons de desconto"
        description="Crie cupons para campanhas e parcerias com influenciadores."
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/cupons/parceiros"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Parceiros
            </Link>
          </div>
        }
      />

      <CouponAnalyticsCards summary={summary} />

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Cupons</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Desconto total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Nenhum cupom cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/cupons/${item.id}`}
                          className="font-mono font-semibold uppercase hover:underline"
                        >
                          {formatCouponCode(item.code)}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatCouponValue({
                          type: item.type,
                          value: item.value,
                        })}
                      </TableCell>
                      <TableCell>
                        {item.partnerName ? (
                          <div>
                            <p>{item.partnerName}</p>
                            {item.partnerHandle && (
                              <p className="text-xs text-muted-foreground">
                                @{item.partnerHandle.replace(/^@/, "")}
                              </p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {item.orderCount}
                        {item.maxUses ? ` / ${item.maxUses}` : ""}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.validFrom || item.validUntil ? (
                          <div className="space-y-0.5">
                            {item.validFrom && (
                              <p>De {formatDate(item.validFrom)}</p>
                            )}
                            {item.validUntil && (
                              <p>Até {formatDate(item.validUntil)}</p>
                            )}
                          </div>
                        ) : (
                          "Sem limite"
                        )}
                      </TableCell>
                      <TableCell>
                        <CouponStatusBadge status={item.status} />
                      </TableCell>
                      <TableCell>{formatCurrency(item.totalDiscount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo cupom</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponForm partners={partners} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
