import type { StoreCatalogFilters } from "@/lib/store/get-store-products";

export type ProductSearchParams = {
  q: string;
  categoria: string;
  temporada: string;
  tags: string[];
  precoMin: string;
  precoMax: string;
  sort: string;
};

export const emptyProductSearchParams = (): ProductSearchParams => ({
  q: "",
  categoria: "",
  temporada: "",
  tags: [],
  precoMin: "",
  precoMax: "",
  sort: "",
});

export function buildProductsHref(params: Partial<ProductSearchParams>) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.categoria) search.set("categoria", params.categoria);
  if (params.temporada) search.set("temporada", params.temporada);
  if (params.tags && params.tags.length > 0) {
    search.set("tags", params.tags.join(","));
  }
  if (params.precoMin) search.set("preco_min", params.precoMin);
  if (params.precoMax) search.set("preco_max", params.precoMax);
  if (params.sort) search.set("sort", params.sort);

  const query = search.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

export function centsToReaisInput(cents: number) {
  if (cents <= 0) return "";
  return (cents / 100).toFixed(0);
}

export type { StoreCatalogFilters };
