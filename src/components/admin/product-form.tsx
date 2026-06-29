"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { CategorySelectField } from "@/components/admin/category-select-field";
import { ProductGalleryImagesField } from "@/components/admin/product-gallery-images-field";
import { ProductSocialLinksField } from "@/components/admin/product-social-links-field";
import { ProductImageUploadField } from "@/components/admin/product-image-upload-field";
import { ProductTagsField } from "@/components/admin/product-tags-field";
import { PurchaseSourceField } from "@/components/admin/purchase-source-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateMarginPercent } from "@/lib/prices";
import { PRODUCT_SEASONS } from "@/lib/store/product-season";
import { cn, formatCurrency } from "@/lib/utils";
import type {
  ActionResult,
  Category,
  Product,
  ProductImage,
  ProductSocialEmbed,
  ProductTag,
  Supplier,
} from "@/types";

type ProductFormProps = {
  action: (
    prevState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  categories: Category[];
  suppliers: Supplier[];
  tags?: ProductTag[];
  defaultTagIds?: string[];
  initialData?: Product & {
    stock?: number;
    coverImage?: ProductImage | null;
    galleryImages?: ProductImage[];
    socialLinks?: ProductSocialEmbed[];
  };
  onDeleteGalleryImage?: (
    imageId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
};

const initialState: ActionResult = { success: false, error: "" };

export function ProductForm({
  action,
  categories,
  suppliers,
  tags = [],
  defaultTagIds = [],
  initialData,
  onDeleteGalleryImage,
  submitLabel,
}: ProductFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [costPrice, setCostPrice] = useState(
    initialData ? (initialData.costPrice / 100).toFixed(2).replace(".", ",") : "",
  );
  const [salePrice, setSalePrice] = useState(
    initialData ? (initialData.salePrice / 100).toFixed(2).replace(".", ",") : "",
  );

  const margin = useMemo(() => {
    const cost = Number(costPrice.replace(/\./g, "").replace(",", "."));
    const sale = Number(salePrice.replace(/\./g, "").replace(",", "."));

    if (!Number.isFinite(cost) || !Number.isFinite(sale) || sale <= 0) {
      return null;
    }

    return calculateMarginPercent(Math.round(sale * 100), Math.round(cost * 100));
  }, [costPrice, salePrice]);

  useEffect(() => {
    if (state.success) {
      toast.success("Produto salvo com sucesso.");
      router.refresh();
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">
            Nome do produto <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            placeholder="gerado-automaticamente"
            defaultValue={initialData?.slug}
          />
        </div>

        <CategorySelectField
          name="categoryId"
          label="Categoria"
          categories={categories}
          defaultValue={initialData?.categoryId}
        />

        <div className="space-y-2">
          <Label htmlFor="season">Temporada</Label>
          <select
            id="season"
            name="season"
            defaultValue={initialData?.season ?? "all_season"}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {PRODUCT_SEASONS.map((season) => (
              <option key={season.value} value={season.value}>
                {season.label}
              </option>
            ))}
          </select>
        </div>

        <ProductTagsField tags={tags} defaultTagIds={defaultTagIds} />

        <PurchaseSourceField
          suppliers={suppliers}
          defaultSource={initialData?.purchaseSource ?? "in_house"}
          defaultSupplierId={initialData?.supplierId}
        />

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initialData?.description ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="costPrice">
            Preço de custo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="costPrice"
            name="costPrice"
            inputMode="decimal"
            placeholder="0,00"
            required
            value={costPrice}
            onChange={(event) => setCostPrice(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salePrice">
            Preço de venda <span className="text-destructive">*</span>
          </Label>
          <Input
            id="salePrice"
            name="salePrice"
            inputMode="decimal"
            placeholder="0,00"
            required
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
          />
        </div>

        <div className="rounded-lg border p-4 md:col-span-2">
          <p className="text-sm text-muted-foreground">Margem bruta estimada</p>
          <p
            className={cn(
              "text-2xl font-semibold",
              margin !== null && margin < 20 && "text-destructive",
            )}
          >
            {margin === null ? "—" : `${margin}%`}
          </p>
          {margin !== null && margin < 20 && (
            <p className="mt-1 text-sm text-destructive">
              Margem abaixo de 20%. Revise os preços.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" defaultValue={initialData?.sku ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barcode">Código de barras</Label>
          <Input
            id="barcode"
            name="barcode"
            defaultValue={initialData?.barcode ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Estoque (variante padrão)</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min={0}
            defaultValue={initialData?.stock ?? 0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? "draft"}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="draft">Rascunho</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="fakeOrderCount">Quantidade já compradas (vitrine)</Label>
          <Input
            id="fakeOrderCount"
            name="fakeOrderCount"
            type="number"
            min={0}
            step={1}
            defaultValue={initialData?.fakeOrderCount ?? 0}
          />
          <p className="text-sm text-muted-foreground">
            Número exibido na página do produto como prova social. Não usa
            pedidos reais — deixe 0 para ocultar.
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <input
              id="isFeatured"
              name="isFeatured"
              type="checkbox"
              defaultChecked={initialData?.isFeatured ?? false}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <div className="space-y-1">
              <Label htmlFor="isFeatured">Produto em destaque</Label>
              <p className="text-sm text-muted-foreground">
                Exibe na home em carrossel. Máximo de 5 produtos em destaque.
              </p>
            </div>
          </div>
        </div>

        <ProductImageUploadField
          name="coverImage"
          type="cover"
          label="Imagem de capa"
          existingUrl={initialData?.coverImage?.url}
          existingAlt={initialData?.coverImage?.alt ?? initialData?.name}
        />

        <ProductGalleryImagesField
          existingImages={initialData?.galleryImages ?? []}
          onDeleteImage={onDeleteGalleryImage}
        />

        <ProductSocialLinksField
          existingLinks={initialData?.socialLinks ?? []}
        />
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        {initialData && (
          <p className="text-sm text-muted-foreground">
            Preço atual: {formatCurrency(initialData.salePrice)}
          </p>
        )}
      </div>
    </form>
  );
}
