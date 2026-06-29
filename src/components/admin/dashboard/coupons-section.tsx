import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  CouponAnalyticsSummary,
  TopCouponStat,
} from "@/lib/admin/coupon-stats";
import { formatCouponCode } from "@/lib/store/coupon-utils";
import { formatCurrency } from "@/lib/utils";

type DashboardCouponsSectionProps = {
  summary: CouponAnalyticsSummary;
  topCoupons: TopCouponStat[];
};

export function DashboardCouponsSection({
  summary,
  topCoupons,
}: DashboardCouponsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Cupons de desconto</CardTitle>
          <CardDescription>
            Resumo de uso e desempenho das campanhas
          </CardDescription>
        </div>
        <Link
          href="/admin/cupons"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Ver cupons →
        </Link>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Cupons ativos</p>
            <p className="mt-1 text-2xl font-semibold">{summary.activeCoupons}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Usos em pedidos</p>
            <p className="mt-1 text-2xl font-semibold">{summary.totalUses}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Desconto concedido</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCurrency(summary.totalDiscountGiven)}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Parceiros</p>
            <p className="mt-1 text-2xl font-semibold">{summary.partnerCount}</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Parceiro</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Desconto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nenhum cupom usado em pedidos ainda.
                </TableCell>
              </TableRow>
            ) : (
              topCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <Link
                      href={`/admin/cupons/${coupon.id}`}
                      className="font-mono font-semibold uppercase hover:underline"
                    >
                      {formatCouponCode(coupon.code)}
                    </Link>
                  </TableCell>
                  <TableCell>{coupon.partnerName ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{coupon.orderCount}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(coupon.totalDiscount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
