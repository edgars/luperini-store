"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CategorySelectField } from "@/components/admin/category-select-field";
import { ProductImageUploadField } from "@/components/admin/product-image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { calculateMarginPercent } from "@/lib/prices";
import { cn, formatCurrency } from "@/lib/utils";
import type { ActionResult, Category, Product, ProductImage } from "@/types";

type ProductFormProps = {
  action: (
    prevState: ActionResult,
    formData: FormData,
  ) => Promise<ActionResult>;
  categories: Category[];
  initialData?: Product & {
    stock?: number;
    coverImage?: ProductImage | null;
  };
  submitLabel: string;
};

const initialState: ActionResult = { success: false, error: "" };

export function ProductForm({
  action,
  categories,
  initialData,
  submitLabel,
}: ProductFormProps) {
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
    } else if (!state.success && state.error) {
      toast.error(state.error);
    }
  }, [state]);

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

        <ProductImageUploadField
          name="coverImage"
          type="cover"
          label="Imagem de capa"
          existingUrl={initialData?.coverImage?.url}
          existingAlt={initialData?.coverImage?.alt ?? initialData?.name}
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
