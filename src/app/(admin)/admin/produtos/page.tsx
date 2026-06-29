import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { categories, products, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { countFeaturedProducts } from "@/lib/store/featured-products";
import { cn } from "@/lib/utils";

export default async function AdminProductsPage() {
  await requireAdmin();

  const [items, featuredCount] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        status: products.status,
        isFeatured: products.isFeatured,
        purchaseSource: products.purchaseSource,
        supplierId: products.supplierId,
        supplierName: suppliers.name,
        salePrice: products.salePrice,
        margin: products.margin,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .orderBy(desc(products.createdAt)),
    countFeaturedProducts(),
  ]);

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
            <Link
              href="/admin/produtos/tags"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Tags
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
            <ProductsTable items={items} featuredCount={featuredCount} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
