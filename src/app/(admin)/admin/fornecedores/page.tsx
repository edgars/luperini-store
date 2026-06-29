import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SupplierCollapsibleForm } from "@/components/admin/supplier-collapsible-form";
import { SuppliersMasterDetail } from "@/components/admin/suppliers-master-detail";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import {
  getSupplierLinkedProducts,
  getSuppliersWithStats,
  groupProductsBySupplier,
} from "@/lib/admin/supplier-stats";
import { cn } from "@/lib/utils";

export default async function AdminSuppliersPage() {
  await requireAdmin();

  const [items, linkedProducts] = await Promise.all([
    getSuppliersWithStats(),
    getSupplierLinkedProducts(),
  ]);

  const productsBySupplier = groupProductsBySupplier(linkedProducts);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Fornecedores"
        description="Cadastre fornecedores e acompanhe o desempenho de cada um."
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/contatos"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Contatos
            </Link>
            <Link
              href="/admin/produtos"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar aos produtos
            </Link>
          </div>
        }
      />

      <SupplierCollapsibleForm />

      <Card className="w-full">
        <CardContent className="pt-6">
          <SuppliersMasterDetail
            items={items}
            productsBySupplier={productsBySupplier}
          />
        </CardContent>
      </Card>
    </div>
  );
}
