"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { buildProductsHref } from "@/lib/store/product-search";

type ProductPriceFilterProps = {
  priceMin?: string;
  priceMax?: string;
  hiddenParams: Record<string, string | string[] | undefined>;
};

export function ProductPriceFilter({
  priceMin = "",
  priceMax = "",
  hiddenParams,
}: ProductPriceFilterProps) {
  const router = useRouter();
  const [min, setMin] = useState(priceMin);
  const [max, setMax] = useState(priceMax);

  function handleApply(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      buildProductsHref({
        q: hiddenParams.q as string | undefined,
        categoria: hiddenParams.categoria as string | undefined,
        temporada: hiddenParams.temporada as string | undefined,
        tags: hiddenParams.tags as string[] | undefined,
        sort: hiddenParams.sort as string | undefined,
        precoMin: min,
        precoMax: max,
      }),
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-3">
      <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
        Preço (R$)
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          placeholder="Mín"
          value={min}
          onChange={(event) => setMin(event.target.value)}
          className="h-10 w-full rounded-full border border-store-charcoal/15 bg-transparent px-4 font-store-sans text-sm text-store-charcoal outline-none"
        />
        <span className="text-store-charcoal/35">—</span>
        <input
          type="number"
          min={0}
          placeholder="Máx"
          value={max}
          onChange={(event) => setMax(event.target.value)}
          className="h-10 w-full rounded-full border border-store-charcoal/15 bg-transparent px-4 font-store-sans text-sm text-store-charcoal outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border border-store-charcoal/15 px-4 py-2 font-store-sans text-[10px] uppercase tracking-[0.14em] text-store-charcoal transition-opacity hover:opacity-60"
        >
          Aplicar
        </button>
      </div>
    </form>
  );
}
