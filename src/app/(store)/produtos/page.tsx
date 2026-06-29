import Link from "next/link";
import type { Metadata } from "next";

import { ProductCard } from "@/components/store/product-card";
import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import { StorePageNav } from "@/components/store/store-page-nav";
import {
  getStoreCatalogFilters,
  getStoreProducts,
  parseStoreProductsQuery,
} from "@/lib/store/get-store-products";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    sort?: string;
    temporada?: string;
    tags?: string;
    preco_min?: string;
    preco_max?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = parseStoreProductsQuery(params);
  const { activeCategory } = await getStoreProducts(query);

  if (query.q) {
    return {
      title: `Busca: ${query.q}`,
      description: `Resultados para "${query.q}" na Luperini Store.`,
    };
  }

  if (activeCategory) {
    return {
      title: activeCategory.name,
      description: `Confira ${activeCategory.name.toLowerCase()} na Luperini Store.`,
    };
  }

  return {
    title: "Produtos",
    description: "Explore o catálogo completo da Luperini Store.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = parseStoreProductsQuery(params);

  const [{ products, activeCategory, total }, catalogFilters] =
    await Promise.all([getStoreProducts(query), getStoreCatalogFilters()]);

  const title = query.q
    ? "Busca"
    : activeCategory?.name ?? "Produtos";
  const hasInvalidCategory = Boolean(query.categorySlug && !activeCategory);
  const activeTags = query.tagSlugs ?? [];

  const breadcrumbItems = activeCategory
    ? [{ label: "Produtos", href: "/produtos" }, { label: activeCategory.name }]
    : [{ label: "Produtos" }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <StorePageNav
        breadcrumbs={breadcrumbItems}
        backHref={activeCategory ? "/produtos" : "/"}
      />

      <header className="mb-10 sm:mb-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-store-serif text-3xl text-store-charcoal sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl font-store-sans text-sm text-store-charcoal/60">
              {query.q
                ? `${total} ${total === 1 ? "resultado" : "resultados"} encontrados.`
                : activeCategory
                  ? `${total} ${total === 1 ? "peça" : "peças"} nesta categoria.`
                  : `${total} ${total === 1 ? "peça" : "peças"} no catálogo.`}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-10">
        <ProductCatalogFilters
          categories={catalogFilters.categories}
          tags={catalogFilters.tags}
          activeCategorySlug={query.categorySlug}
          activeSeason={query.season}
          activeTags={activeTags}
          activeQuery={query.q}
          priceMin={params.preco_min}
          priceMax={params.preco_max}
          sort={query.sort}
        />
      </div>

      {hasInvalidCategory ? (
        <div className="rounded-2xl border border-dashed border-store-charcoal/15 px-6 py-16 text-center">
          <p className="font-store-sans text-sm text-store-charcoal/60">
            Categoria não encontrada ou sem produtos disponíveis.
          </p>
          <Link
            href="/produtos"
            className="mt-4 inline-block font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
          >
            Ver todos os produtos
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-store-charcoal/15 px-6 py-16 text-center">
          <p className="font-store-sans text-sm text-store-charcoal/60">
            Nenhum produto encontrado com os filtros selecionados.
          </p>
          <Link
            href="/produtos"
            className="mt-4 inline-block font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
          >
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
