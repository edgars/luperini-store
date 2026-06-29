import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductStatusBadge } from "@/components/admin/product-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { categories, products, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminProductsPage() {
  await requireAdmin();

  const items = await db
    .select({
      id: products.id,
      name: products.name,
      status: products.status,
      isFeatured: products.isFeatured,
      purchaseSource: products.purchaseSource,
      supplierName: suppliers.name,
      salePrice: products.salePrice,
      margin: products.margin,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Produtos"
        description="Gerencie o catálogo da loja."
        actions={
          <>
            <Link
              href="/admin/fornecedores"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Fornecedores
            </Link>
            <Link
              href="/admin/categorias"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Categorias
            </Link>
            <Link href="/admin/produtos/novo" className={cn(buttonVariants())}>
              Novo produto
            </Link>
          </>
        }
      />

      <Card className="w-full">
        <CardContent className="pt-6">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="text-muted-foreground">Nenhum produto cadastrado.</p>
              <Link
                href="/admin/produtos/novo"
                className={cn(buttonVariants(), "mt-4 inline-flex")}
              >
                Criar primeiro produto
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destaque</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        href={`/admin/produtos/${item.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                    </TableCell>
                    <TableCell>{item.categoryName ?? "—"}</TableCell>
                    <TableCell>
                      {item.purchaseSource === "in_house"
                        ? "Fabricação própria"
                        : (item.supplierName ?? "Fornecedor")}
                    </TableCell>
                    <TableCell>{formatCurrency(item.salePrice)}</TableCell>
                    <TableCell
                      className={
                        item.margin < 20 ? "text-destructive" : undefined
                      }
                    >
                      {item.margin}%
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      {item.isFeatured ? (
                        <span className="text-xs font-medium text-amber-700">
                          Em destaque
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
