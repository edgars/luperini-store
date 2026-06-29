"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import { useProductSearch } from "@/components/store/product-search-provider";
import {
  buildProductsHref,
  centsToReaisInput,
  emptyProductSearchParams,
  type ProductSearchParams,
} from "@/lib/store/product-search";
import type { StoreProductCard } from "@/lib/store/get-featured-products";
import { cn, formatCurrency } from "@/lib/utils";

function toggleTag(tags: string[], slug: string) {
  return tags.includes(slug)
    ? tags.filter((item) => item !== slug)
    : [...tags, slug];
}

export function ProductSearchOverlay() {
  const router = useRouter();
  const { isOpen, closeSearch, catalogFilters, openSearch } = useProductSearch();
  const [params, setParams] = useState<ProductSearchParams>(
    emptyProductSearchParams,
  );
  const [results, setResults] = useState<StoreProductCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeSearch, openSearch]);

  useEffect(() => {
    if (!isOpen) {
      setParams(emptyProductSearchParams());
      setResults([]);
      setTotal(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);

      const search = new URLSearchParams();
      if (params.q.trim()) search.set("q", params.q.trim());
      if (params.categoria) search.set("categoria", params.categoria);
      if (params.temporada) search.set("temporada", params.temporada);
      if (params.tags.length > 0) search.set("tags", params.tags.join(","));
      if (params.precoMin) search.set("preco_min", params.precoMin);
      if (params.precoMax) search.set("preco_max", params.precoMax);
      if (params.sort) search.set("sort", params.sort);

      try {
        const response = await fetch(`/api/store/products?${search.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = (await response.json()) as {
          products: StoreProductCard[];
          total: number;
        };
        setResults(data.products);
        setTotal(data.total);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [isOpen, params]);

  const priceBounds = useMemo(
    () => ({
      min: centsToReaisInput(catalogFilters.priceRange.min),
      max: centsToReaisInput(catalogFilters.priceRange.max),
    }),
    [catalogFilters.priceRange.max, catalogFilters.priceRange.min],
  );

  if (!isOpen) return null;

  const filterPillClass =
    "shrink-0 rounded-full border px-3 py-1.5 font-store-sans text-[10px] uppercase tracking-[0.14em] transition-colors";

  function handleBrowseAll() {
    router.push(buildProductsHref(params));
    closeSearch();
  }

  return (
    <div className="fixed inset-0 z-50 bg-store-cream/98 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <label htmlFor="store-search-input" className="sr-only">
              Buscar produtos
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-0 top-1/2 size-6 -translate-y-1/2 text-store-charcoal/35 sm:size-7" />
              <input
                id="store-search-input"
                type="search"
                autoFocus
                value={params.q}
                onChange={(event) =>
                  setParams((current) => ({ ...current, q: event.target.value }))
                }
                placeholder="Buscar peças, tags ou categorias..."
                className="w-full border-0 border-b border-store-charcoal/15 bg-transparent py-4 pl-10 pr-4 font-store-serif text-3xl text-store-charcoal outline-none placeholder:text-store-charcoal/30 sm:py-5 sm:pl-12 sm:text-4xl lg:text-5xl"
              />
            </div>
            <p className="mt-3 font-store-sans text-xs text-store-charcoal/45">
              {loading
                ? "Buscando..."
                : `${total} ${total === 1 ? "resultado" : "resultados"}`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeSearch}
            aria-label="Fechar busca"
            className="rounded-full border border-store-charcoal/15 p-2 text-store-charcoal transition-opacity hover:opacity-60"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto pb-8">
          <section className="space-y-3">
            <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
              Categoria
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() =>
                  setParams((current) => ({ ...current, categoria: "" }))
                }
                className={cn(
                  filterPillClass,
                  !params.categoria
                    ? "border-store-charcoal bg-store-charcoal text-store-cream"
                    : "border-store-charcoal/15 text-store-charcoal",
                )}
              >
                Todas
              </button>
              {catalogFilters.categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() =>
                    setParams((current) => ({
                      ...current,
                      categoria:
                        current.categoria === category.slug ? "" : category.slug,
                    }))
                  }
                  className={cn(
                    filterPillClass,
                    params.categoria === category.slug
                      ? "border-store-charcoal bg-store-charcoal text-store-cream"
                      : "border-store-charcoal/15 text-store-charcoal",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
                Temporada
              </p>
              <div className="flex flex-wrap gap-2">
                {catalogFilters.seasons.map((season) => (
                  <button
                    key={season.value}
                    type="button"
                    onClick={() =>
                      setParams((current) => ({
                        ...current,
                        temporada:
                          current.temporada === season.value ? "" : season.value,
                      }))
                    }
                    className={cn(
                      filterPillClass,
                      params.temporada === season.value
                        ? "border-store-charcoal bg-store-charcoal text-store-cream"
                        : "border-store-charcoal/15 text-store-charcoal",
                    )}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
                Preço (R$)
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  placeholder={priceBounds.min || "Mín"}
                  value={params.precoMin}
                  onChange={(event) =>
                    setParams((current) => ({
                      ...current,
                      precoMin: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-full border border-store-charcoal/15 bg-transparent px-4 font-store-sans text-sm text-store-charcoal outline-none"
                />
                <span className="text-store-charcoal/35">—</span>
                <input
                  type="number"
                  min={0}
                  placeholder={priceBounds.max || "Máx"}
                  value={params.precoMax}
                  onChange={(event) =>
                    setParams((current) => ({
                      ...current,
                      precoMax: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-full border border-store-charcoal/15 bg-transparent px-4 font-store-sans text-sm text-store-charcoal outline-none"
                />
              </div>
            </div>
          </section>

          {catalogFilters.tags.length > 0 && (
            <section className="space-y-3">
              <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {catalogFilters.tags.map((tag) => (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() =>
                      setParams((current) => ({
                        ...current,
                        tags: toggleTag(current.tags, tag.slug),
                      }))
                    }
                    className={cn(
                      filterPillClass,
                      params.tags.includes(tag.slug)
                        ? "border-store-charcoal bg-store-charcoal text-store-cream"
                        : "border-store-charcoal/15 text-store-charcoal",
                    )}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-store-charcoal/10 pt-5">
            <button
              type="button"
              onClick={handleBrowseAll}
              className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
            >
              Ver todos os resultados →
            </button>
            {(params.q ||
              params.categoria ||
              params.temporada ||
              params.tags.length > 0 ||
              params.precoMin ||
              params.precoMax) && (
              <button
                type="button"
                onClick={() => setParams(emptyProductSearchParams())}
                className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal/45 transition-opacity hover:opacity-60"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {results.slice(0, 8).map((product) => (
                <Link
                  key={product.slug}
                  href={`/produtos/${product.slug}`}
                  onClick={closeSearch}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.imageAlt ?? product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <StripePlaceholder className="h-full w-full rounded-2xl" />
                    )}
                  </div>
                  <p className="mt-3 font-store-sans text-sm text-store-charcoal">
                    {product.name}
                  </p>
                  <p className="mt-1 font-store-sans text-sm text-store-charcoal/50">
                    {formatCurrency(product.priceInCents)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
