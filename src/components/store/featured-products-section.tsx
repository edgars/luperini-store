import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import type { StoreProductCard } from "@/lib/store/get-featured-products";

interface FeaturedProductsSectionProps {
  products: StoreProductCard[];
}

export function FeaturedProductsSection({
  products,
}: FeaturedProductsSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
      <div className="mb-10 flex items-end justify-between gap-6 sm:mb-12">
        <h2 className="font-store-serif text-2xl text-store-charcoal sm:text-3xl">
          Peças em destaque
        </h2>
        <Link
          href="/produtos"
          className="shrink-0 font-store-sans text-[11px] uppercase tracking-[0.18em] text-store-charcoal transition-opacity hover:opacity-60"
        >
          Ver tudo →
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="font-store-sans text-sm text-store-charcoal/60">
          Nenhum produto disponível no momento.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              name={product.name}
              slug={product.slug}
              priceInCents={product.priceInCents}
              imageUrl={product.imageUrl}
              imageAlt={product.imageAlt}
            />
          ))}
        </div>
      )}
    </section>
  );
}
