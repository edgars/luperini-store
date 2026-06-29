import Link from "next/link";
import { asc } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  CouponPartnerForm,
  DeleteCouponPartnerButton,
} from "@/components/admin/coupon-partner-form";
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
import { getPartnerCouponStats } from "@/lib/admin/coupon-stats";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function AdminCouponPartnersPage() {
  await requireAdmin();

  const partners = await db
    .select()
    .from(couponPartners)
    .orderBy(asc(couponPartners.name));

  const couponCounts = await getPartnerCouponStats(
    partners.map((partner) => partner.id),
  );

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Parceiros e influenciadores"
        description="Cadastre parceiros para vincular cupons de desconto."
        actions={
          <Link
            href="/admin/cupons"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar aos cupons
          </Link>
        }
      />

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>Cupons</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      Nenhum parceiro cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  partners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>
                        {partner.handle
                          ? `@${partner.handle.replace(/^@/, "")}`
                          : "—"}
                      </TableCell>
                      <TableCell>{couponCounts.get(partner.id) ?? 0}</TableCell>
                      <TableCell>
                        {partner.isActive ? "Ativo" : "Inativo"}
                      </TableCell>
                      <TableCell>
                        <DeleteCouponPartnerButton id={partner.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novo parceiro</CardTitle>
          </CardHeader>
          <CardContent>
            <CouponPartnerForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
