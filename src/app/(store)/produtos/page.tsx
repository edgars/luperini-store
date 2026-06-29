import Link from "next/link";
import type { Metadata } from "next";

import { ProductCard } from "@/components/store/product-card";
import { ProductCatalogFilters } from "@/components/store/product-catalog-filters";
import {
  getStoreCategoryFilters,
  getStoreProducts,
} from "@/lib/store/get-store-products";

type ProductsPageProps = {
  searchParams: Promise<{ categoria?: string; sort?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { categoria, sort } = await searchParams;
  const { activeCategory } = await getStoreProducts({
    categorySlug: categoria,
    sort,
  });

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
  const { categoria, sort } = await searchParams;

  const [{ products, activeCategory }, categoryFilters] = await Promise.all([
    getStoreProducts({ categorySlug: categoria, sort }),
    getStoreCategoryFilters(),
  ]);

  const title = activeCategory?.name ?? "Produtos";
  const hasInvalidCategory = Boolean(categoria && !activeCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <header className="mb-10 sm:mb-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/45"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-opacity hover:opacity-70">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-store-charcoal">Produtos</li>
            {activeCategory && (
              <>
                <li aria-hidden>/</li>
                <li className="text-store-charcoal">{activeCategory.name}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-store-serif text-3xl text-store-charcoal sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl font-store-sans text-sm text-store-charcoal/60">
              {activeCategory
                ? `${products.length} ${products.length === 1 ? "peça" : "peças"} nesta categoria.`
                : "Peças selecionadas com elegância e conforto para o seu dia a dia."}
            </p>
          </div>
        </div>
      </header>

      <div className="mb-10">
        <ProductCatalogFilters
          categories={categoryFilters}
          activeCategorySlug={categoria}
          sort={sort}
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
            Nenhum produto disponível no momento.
          </p>
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
