"use client";

import { useProductSearch } from "@/components/store/product-search-provider";

export function StoreSearchTrigger() {
  const { openSearch } = useProductSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
    >
      Buscar
    </button>
  );
}
