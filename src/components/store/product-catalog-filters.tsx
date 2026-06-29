import Link from "next/link";

import { ProductPriceFilter } from "@/components/store/product-price-filter";
import type {
  StoreCategoryFilter,
  StoreTagFilter,
} from "@/lib/store/get-store-products";
import { getSeasonLabel, PRODUCT_SEASONS } from "@/lib/store/product-season";
import { cn } from "@/lib/utils";

type ProductCatalogFiltersProps = {
  categories: StoreCategoryFilter[];
  tags: StoreTagFilter[];
  activeCategorySlug?: string;
  activeSeason?: string;
  activeTags?: string[];
  activeQuery?: string;
  priceMin?: string;
  priceMax?: string;
  sort?: string;
};

function buildHref(options: {
  categorySlug?: string;
  sort?: string;
  season?: string;
  tags?: string[];
  q?: string;
  priceMin?: string;
  priceMax?: string;
}) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.categorySlug) params.set("categoria", options.categorySlug);
  if (options.sort) params.set("sort", options.sort);
  if (options.season) params.set("temporada", options.season);
  if (options.tags && options.tags.length > 0) {
    params.set("tags", options.tags.join(","));
  }
  if (options.priceMin) params.set("preco_min", options.priceMin);
  if (options.priceMax) params.set("preco_max", options.priceMax);
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

const filterLinkClass =
  "shrink-0 rounded-full border px-4 py-2 font-store-sans text-[10px] uppercase tracking-[0.16em] transition-colors";

export function ProductCatalogFilters({
  categories,
  tags,
  activeCategorySlug,
  activeSeason,
  activeTags = [],
  activeQuery,
  priceMin,
  priceMax,
  sort,
}: ProductCatalogFiltersProps) {
  const sortOptions = [
    { label: "Novidades", value: "novidades" },
    { label: "Lookbook", value: "lookbook" },
    { label: "Menor preço", value: "preco_asc" },
    { label: "Maior preço", value: "preco_desc" },
  ] as const;

  const shared = {
    q: activeQuery,
    season: activeSeason,
    tags: activeTags,
    priceMin,
    priceMax,
    sort,
  };

  const hasFilters = Boolean(
    activeQuery ||
      activeCategorySlug ||
      activeSeason ||
      activeTags.length > 0 ||
      priceMin ||
      priceMax,
  );

  return (
    <div className="space-y-6">
      {activeQuery && (
        <p className="font-store-sans text-sm text-store-charcoal/60">
          Resultados para{" "}
          <span className="text-store-charcoal">&ldquo;{activeQuery}&rdquo;</span>
        </p>
      )}

      <nav
        aria-label="Filtrar por categoria"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        <Link
          href={buildHref({ ...shared, categorySlug: undefined })}
          className={cn(
            filterLinkClass,
            !activeCategorySlug
              ? "border-store-charcoal bg-store-charcoal text-store-cream"
              : "border-store-charcoal/15 text-store-charcoal hover:border-store-charcoal/30",
          )}
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={buildHref({
              ...shared,
              categorySlug:
                activeCategorySlug === category.slug ? undefined : category.slug,
            })}
            className={cn(
              filterLinkClass,
              activeCategorySlug === category.slug
                ? "border-store-charcoal bg-store-charcoal text-store-cream"
                : "border-store-charcoal/15 text-store-charcoal hover:border-store-charcoal/30",
            )}
          >
            {category.name}
            <span className="ml-1.5 opacity-60">({category.productCount})</span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-2">
        <nav aria-label="Filtrar por temporada" className="space-y-3">
          <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
            Temporada
          </p>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_SEASONS.map((season) => (
              <Link
                key={season.value}
                href={buildHref({
                  ...shared,
                  season:
                    activeSeason === season.value ? undefined : season.value,
                })}
                className={cn(
                  filterLinkClass,
                  activeSeason === season.value
                    ? "border-store-charcoal bg-store-charcoal text-store-cream"
                    : "border-store-charcoal/15 text-store-charcoal hover:border-store-charcoal/30",
                )}
              >
                {season.label}
              </Link>
            ))}
          </div>
        </nav>

        {tags.length > 0 && (
          <nav aria-label="Filtrar por tags" className="space-y-3">
            <p className="font-store-sans text-[10px] uppercase tracking-[0.18em] text-store-charcoal/45">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={buildHref({
                    ...shared,
                    tags: toggleValue(activeTags, tag.slug),
                  })}
                  className={cn(
                    filterLinkClass,
                    activeTags.includes(tag.slug)
                      ? "border-store-charcoal bg-store-charcoal text-store-cream"
                      : "border-store-charcoal/15 text-store-charcoal hover:border-store-charcoal/30",
                  )}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>

      <ProductPriceFilter
        priceMin={priceMin}
        priceMax={priceMax}
        hiddenParams={{
          q: activeQuery,
          categoria: activeCategorySlug,
          temporada: activeSeason,
          tags: activeTags,
          sort,
        }}
      />

      <nav
        aria-label="Ordenar produtos"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={buildHref({
              ...shared,
              categorySlug: activeCategorySlug,
              sort: sort === option.value ? undefined : option.value,
            })}
            className={cn(
              "font-store-sans text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-60",
              sort === option.value
                ? "text-store-charcoal"
                : "text-store-charcoal/45",
            )}
          >
            {option.label}
          </Link>
        ))}
        {hasFilters && (
          <Link
            href="/produtos"
            className="font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal/45 transition-opacity hover:opacity-60"
          >
            Limpar filtros
          </Link>
        )}
      </nav>

      {activeSeason && (
        <p className="font-store-sans text-xs text-store-charcoal/45">
          Temporada: {getSeasonLabel(activeSeason as never)}
        </p>
      )}
    </div>
  );
}
