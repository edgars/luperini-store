"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { ProductSocialProof } from "@/components/store/product-social-proof";
import type { StoreProductDetail } from "@/lib/store/get-product-by-slug";
import {
  findVariantBySelections,
  formatAttributeLabel,
  getAttributeGroups,
  getInitialSelections,
  hasAttributeOptions,
  hasMultipleNamedVariants,
} from "@/lib/store/variant-options";
import { cn, formatCurrency } from "@/lib/utils";

type ProductPurchasePanelProps = {
  product: StoreProductDetail;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const attributeGroups = useMemo(
    () => getAttributeGroups(product.variants),
    [product.variants],
  );
  const showAttributeOptions = hasAttributeOptions(product.variants);
  const showNamedVariants = hasMultipleNamedVariants(product.variants);

  const [selections, setSelections] = useState(() =>
    getInitialSelections(product.variants),
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(() => {
    if (showAttributeOptions) {
      return findVariantBySelections(product.variants, selections);
    }

    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ??
      product.variants[0]
    );
  }, [
    product.variants,
    selections,
    selectedVariantId,
    showAttributeOptions,
  ]);

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(Math.max(1, selectedVariant.stock));
    }
  }, [quantity, selectedVariant]);

  if (!selectedVariant) {
    return (
      <p className="font-store-sans text-sm text-store-charcoal/60">
        Este produto não está disponível no momento.
      </p>
    );
  }

  const isOutOfStock = selectedVariant.stock <= 0;
  const maxQuantity = Math.max(selectedVariant.stock, 1);

  function handleAddToCart(redirectToCart = false) {
    if (!selectedVariant) return;

    if (isOutOfStock) {
      toast.error("Produto indisponível no estoque.");
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantName: selectedVariant.name,
      unitPrice: selectedVariant.salePrice,
      quantity,
      imageUrl: product.images[0]?.url ?? null,
    });

    toast.success(
      redirectToCart ? "Redirecionando para a sacola…" : "Adicionado à sacola.",
    );

    if (redirectToCart) {
      router.push("/carrinho");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        {product.category && (
          <p className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal/45">
            {product.category.name}
          </p>
        )}
        <h1 className="mt-3 font-store-serif text-4xl leading-tight text-store-charcoal sm:text-5xl">
          {product.name}
        </h1>
        <p className="mt-4 font-store-sans text-lg text-store-charcoal">
          {formatCurrency(selectedVariant.salePrice)}
        </p>
        {product.sku && (
          <p className="mt-2 font-store-sans text-xs uppercase tracking-[0.14em] text-store-charcoal/45">
            SKU {product.sku}
          </p>
        )}
      </div>

      {product.description && (
        <p className="font-store-sans text-sm leading-7 text-store-charcoal/70">
          {product.description}
        </p>
      )}

      <div className="space-y-6 border-t border-store-charcoal/10 pt-6">
        {showAttributeOptions &&
          Object.entries(attributeGroups).map(([key, values]) => (
            <div key={key} className="space-y-3">
              <p className="font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/55">
                {formatAttributeLabel(key)}
              </p>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isActive = selections[key] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSelections((current) => ({ ...current, [key]: value }))
                      }
                      className={cn(
                        "min-w-12 border px-4 py-2 font-store-sans text-xs uppercase tracking-[0.12em] transition-colors",
                        isActive
                          ? "border-store-charcoal bg-store-charcoal text-white"
                          : "border-store-charcoal/20 text-store-charcoal hover:border-store-charcoal/50",
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        {showNamedVariants && !showAttributeOptions && (
          <div className="space-y-3">
            <p className="font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/55">
              Opção
            </p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const isActive = selectedVariantId === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    disabled={variant.stock <= 0}
                    className={cn(
                      "border px-4 py-2 font-store-sans text-xs uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      isActive
                        ? "border-store-charcoal bg-store-charcoal text-white"
                        : "border-store-charcoal/20 text-store-charcoal hover:border-store-charcoal/50",
                    )}
                  >
                    {variant.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <p className="font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/55">
            Quantidade
          </p>
          <div className="inline-flex items-center border border-store-charcoal/20">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-3 py-2 font-store-sans text-sm text-store-charcoal disabled:opacity-40"
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="min-w-10 px-3 py-2 text-center font-store-sans text-sm">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setQuantity((current) => Math.min(maxQuantity, current + 1))
              }
              disabled={quantity >= selectedVariant.stock || isOutOfStock}
              className="px-3 py-2 font-store-sans text-sm text-store-charcoal disabled:opacity-40"
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>
          <p className="font-store-sans text-xs text-store-charcoal/50">
            {isOutOfStock
              ? "Indisponível"
              : selectedVariant.stock <= 5
                ? `Restam ${selectedVariant.stock} unidade${selectedVariant.stock === 1 ? "" : "s"}`
                : "Em estoque"}
          </p>
        </div>
      </div>

      <ProductSocialProof
        productSlug={product.slug}
        fakeOrderCount={product.fakeOrderCount}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isOutOfStock}
          className="flex-1 border border-store-charcoal bg-transparent px-6 py-3.5 font-store-sans text-[10px] uppercase tracking-[0.2em] text-store-charcoal transition-opacity hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Adicionar à sacola
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isOutOfStock}
          className="flex-1 bg-store-charcoal px-6 py-3.5 font-store-sans text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comprar agora
        </button>
      </div>
    </div>
  );
}
