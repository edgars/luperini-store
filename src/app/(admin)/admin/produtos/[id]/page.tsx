import Link from "next/link";
import { and, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/db";
import {
  categories,
  productImages,
  products,
  productVariants,
} from "@/db/schema";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductForm } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { updateProductAction } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    return (
      <div className="w-full space-y-6">
        <AdminPageHeader title="Produto não encontrado" />
        <Link
          href="/admin/produtos"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  const allCategories = await db.select().from(categories).orderBy(categories.name);
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .limit(1);
  const [coverImage] = await db
    .select()
    .from(productImages)
    .where(
      and(eq(productImages.productId, id), eq(productImages.type, "cover")),
    )
    .limit(1);

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Editar produto"
        description={product.name}
        actions={<DeleteProductButton id={id} />}
      />

      <Card className="w-full">
        <CardContent className="pt-6">
          <ProductForm
            action={updateProductAction.bind(null, id)}
            categories={allCategories}
            initialData={{
              ...product,
              stock: variant?.stock ?? 0,
              coverImage: coverImage ?? null,
            }}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}
