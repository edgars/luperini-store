import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { categories, products, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { createProductAction } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();
  const [allCategories, allSuppliers] = await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db.select().from(suppliers).orderBy(suppliers.name),
  ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Novo produto"
        description="Preencha os dados do produto e envie a imagem de capa."
        actions={
          <Link
            href="/admin/produtos"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voltar
          </Link>
        }
      />

      <Card className="w-full">
        <CardContent className="pt-6">
          <ProductForm
            action={createProductAction}
            categories={allCategories}
            suppliers={allSuppliers}
            submitLabel="Criar produto"
          />
        </CardContent>
      </Card>
    </div>
  );
}
