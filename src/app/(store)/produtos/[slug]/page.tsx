import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import {
  getActiveProductSlugs,
  getProductBySlug,
} from "@/lib/store/get-product-by-slug";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Produto" };
  }

  return {
      title: product.name,
      description:
        product.description ??
        `${product.name} — confira na Luperini Store.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/45"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition-opacity hover:opacity-70">
              Início
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/produtos" className="transition-opacity hover:opacity-70">
              Produtos
            </Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/produtos?categoria=${product.category.slug}`}
                  className="transition-opacity hover:opacity-70"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="text-store-charcoal">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <ProductGallery images={product.images} productName={product.name} />
        <ProductPurchasePanel product={product} />
      </div>
    </div>
  );
}
