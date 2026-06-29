import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SupplierForm } from "@/components/admin/supplier-form";
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
import { requireAdmin } from "@/lib/auth";
import { getSuppliersWithStats } from "@/lib/admin/supplier-stats";
import { cn, formatCurrency } from "@/lib/utils";

export default async function AdminSuppliersPage() {
  await requireAdmin();
  const items = await getSuppliersWithStats();

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

      <div className="grid w-full gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Margem média</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Nenhum fornecedor cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/admin/fornecedores/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.phone && (
                          <p className="text-xs text-muted-foreground">
                            {item.phone}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{item.productCount}</TableCell>
                      <TableCell>{item.purchaseCount}</TableCell>
                      <TableCell>{formatCurrency(item.totalPurchased)}</TableCell>
                      <TableCell>
                        {item.averageMargin !== null
                          ? `${item.averageMargin}%`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {item.isActive ? "Ativo" : "Inativo"}
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
            <CardTitle>Novo fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplierForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
