import { and, asc, eq } from "drizzle-orm";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/db";
import {
  categories,
  productImages,
  productSocialEmbeds,
  products,
  productTags,
  productVariants,
  suppliers,
} from "@/db/schema";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";

import { updateProductAction, deleteProductGalleryImageAction } from "../actions";
import { getProductTagIds } from "../tags/actions";

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
      </div>
    );
  }

  const [allCategories, allSuppliers, allTags, defaultTagIds] =
    await Promise.all([
    db.select().from(categories).orderBy(categories.name),
    db.select().from(suppliers).orderBy(suppliers.name),
    db.select().from(productTags).orderBy(asc(productTags.name)),
    getProductTagIds(id),
  ]);
  const [variant] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .limit(1);
  const [coverImage, galleryImages, socialLinks] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(
        and(eq(productImages.productId, id), eq(productImages.type, "cover")),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null),
    db
      .select()
      .from(productImages)
      .where(
        and(
          eq(productImages.productId, id),
          eq(productImages.type, "gallery"),
        ),
      )
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(productSocialEmbeds)
      .where(eq(productSocialEmbeds.productId, id))
      .orderBy(asc(productSocialEmbeds.position)),
  ]);

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
            suppliers={allSuppliers}
            tags={allTags}
            defaultTagIds={defaultTagIds}
            initialData={{
              ...product,
              stock: variant?.stock ?? 0,
              coverImage,
              galleryImages,
              socialLinks,
            }}
            onDeleteGalleryImage={deleteProductGalleryImageAction}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}
