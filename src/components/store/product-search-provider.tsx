"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { StoreCatalogFilters } from "@/lib/store/get-store-products";

type ProductSearchContextValue = {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  catalogFilters: StoreCatalogFilters;
};

const ProductSearchContext = createContext<ProductSearchContextValue | null>(
  null,
);

export function ProductSearchProvider({
  children,
  catalogFilters,
}: {
  children: ReactNode;
  catalogFilters: StoreCatalogFilters;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      isOpen,
      openSearch,
      closeSearch,
      catalogFilters,
    }),
    [isOpen, openSearch, closeSearch, catalogFilters],
  );

  return (
    <ProductSearchContext.Provider value={value}>
      {children}
    </ProductSearchContext.Provider>
  );
}

export function useProductSearch() {
  const context = useContext(ProductSearchContext);
  if (!context) {
    throw new Error("useProductSearch must be used within ProductSearchProvider");
  }
  return context;
}
