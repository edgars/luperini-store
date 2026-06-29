import Link from "next/link";

import type { StoreCategoryFilter } from "@/lib/store/get-store-products";
import { cn } from "@/lib/utils";

type ProductCatalogFiltersProps = {
  categories: StoreCategoryFilter[];
  activeCategorySlug?: string;
  sort?: string;
};

function buildHref(categorySlug?: string, sort?: string) {
  const params = new URLSearchParams();
  if (categorySlug) params.set("categoria", categorySlug);
  if (sort) params.set("sort", sort);
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

const filterLinkClass =
  "shrink-0 rounded-full border px-4 py-2 font-store-sans text-[10px] uppercase tracking-[0.16em] transition-colors";

export function ProductCatalogFilters({
  categories,
  activeCategorySlug,
  sort,
}: ProductCatalogFiltersProps) {
  const sortOptions = [
    { label: "Novidades", value: "novidades" },
    { label: "Lookbook", value: "lookbook" },
  ] as const;

  return (
    <div className="space-y-4">
      <nav
        aria-label="Filtrar por categoria"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        <Link
          href={buildHref(undefined, sort)}
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
            href={buildHref(category.slug, sort)}
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

      <nav
        aria-label="Ordenar produtos"
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {sortOptions.map((option) => (
          <Link
            key={option.value}
            href={buildHref(activeCategorySlug, option.value)}
            className={cn(
              "font-store-sans text-[11px] uppercase tracking-[0.16em] transition-opacity hover:opacity-60",
              sort === option.value
                ? "text-store-charcoal"
                : "text-store-charcoal/45",
            )}
          >
            {option.label}
          </Link>
        ))}
        {sort && (
          <Link
            href={buildHref(activeCategorySlug)}
            className="font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/45 transition-opacity hover:opacity-60"
          >
            Limpar ordenação
          </Link>
        )}
      </nav>
    </div>
  );
}
