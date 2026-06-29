import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { categories, productTags, suppliers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { asc } from "drizzle-orm";

import { createProductAction } from "../actions";

export default async function NewProductPage() {
  await requireAdmin();
  const [allCategories, allSuppliers, allTags] = await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db.select().from(suppliers).orderBy(suppliers.name),
    db.select().from(productTags).orderBy(asc(productTags.name)),
  ]);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Novo produto"
        description="Preencha os dados do produto e envie a imagem de capa."
      />

      <Card className="w-full">
        <CardContent className="pt-6">
          <ProductForm
            action={createProductAction}
            categories={allCategories}
            suppliers={allSuppliers}
            tags={allTags}
            submitLabel="Criar produto"
          />
        </CardContent>
      </Card>
    </div>
  );
}
