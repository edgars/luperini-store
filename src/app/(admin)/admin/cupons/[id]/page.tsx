import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CouponForm } from "@/components/admin/coupon-form";
import { CouponStatusBadge } from "@/components/admin/coupon-status-badge";
import { DeleteCouponButton } from "@/components/admin/delete-coupon-button";
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
import { getCouponDetailStats } from "@/lib/admin/coupon-stats";
import { requireAdmin } from "@/lib/auth";
import {
  formatCouponCode,
  formatCouponValue,
} from "@/lib/store/coupon-utils";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminCouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const detail = await getCouponDetailStats(id);
  if (!detail) notFound();

  const partners = await db
    .select()
    .from(couponPartners)
    .orderBy(asc(couponPartners.name));

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title={formatCouponCode(detail.coupon.code)}
        description="Detalhes, edição e histórico de uso do cupom."
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/cupons"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar
            </Link>
            <DeleteCouponButton id={id} />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Usos em pedidos</p>
            <p className="text-2xl font-semibold">{detail.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Desconto concedido</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(detail.totalDiscount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Receita com cupom</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(detail.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="mt-2">
              <CouponStatusBadge status={detail.coupon.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Desconto:</span>{" "}
                {formatCouponValue({
                  type: detail.coupon.type,
                  value: detail.coupon.value,
                })}
              </p>
              {detail.coupon.minOrderValue && (
                <p>
                  <span className="text-muted-foreground">Pedido mínimo:</span>{" "}
                  {formatCurrency(detail.coupon.minOrderValue)}
                </p>
              )}
              {detail.coupon.maxUses && (
                <p>
                  <span className="text-muted-foreground">Limite de usos:</span>{" "}
                  {detail.coupon.usedCount} / {detail.coupon.maxUses}
                </p>
              )}
              {detail.coupon.partnerName && (
                <p>
                  <span className="text-muted-foreground">Parceiro:</span>{" "}
                  {detail.coupon.partnerName}
                  {detail.coupon.partnerHandle
                    ? ` (@${detail.coupon.partnerHandle.replace(/^@/, "")})`
                    : ""}
                </p>
              )}
              {detail.coupon.description && (
                <p>
                  <span className="text-muted-foreground">Notas:</span>{" "}
                  {detail.coupon.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pedidos com este cupom</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        Nenhum pedido usou este cupom ainda.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detail.recentOrders.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.guestName ?? "Cliente"}</TableCell>
                        <TableCell>{formatCurrency(order.discount)}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar cupom</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponForm
              partners={partners}
              initialData={{
                id: detail.coupon.id,
                code: detail.coupon.code,
                type: detail.coupon.type,
                value: detail.coupon.value,
                minOrderValue: detail.coupon.minOrderValue,
                maxUses: detail.coupon.maxUses,
                usedCount: detail.coupon.usedCount,
                validFrom: detail.coupon.validFrom,
                validUntil: detail.coupon.validUntil,
                partnerId: detail.coupon.partnerId,
                description: detail.coupon.description,
                isActive: detail.coupon.isActive,
                createdAt: detail.coupon.createdAt,
                updatedAt: detail.coupon.updatedAt,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
