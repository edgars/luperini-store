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
import { categories, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminProductsPage() {
  await requireAdmin();

  const items = await db
    .select({
      id: products.id,
      name: products.name,
      status: products.status,
      salePrice: products.salePrice,
      margin: products.margin,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Produtos"
        description="Gerencie o catálogo da loja."
        actions={
          <>
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
                  <TableHead>Preço</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Status</TableHead>
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
