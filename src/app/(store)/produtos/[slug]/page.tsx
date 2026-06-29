import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { StorePageNav } from "@/components/store/store-page-nav";
import {
  getActiveProductSlugs,
  getProductBySlug,
} from "@/lib/store/get-product-by-slug";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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

  const breadcrumbItems = [
    { label: "Produtos", href: "/produtos" },
    ...(product.category
      ? [
          {
            label: product.category.name,
            href: `/produtos?categoria=${product.category.slug}`,
          },
        ]
      : []),
    { label: product.name },
  ];

  const backHref = product.category
    ? `/produtos?categoria=${product.category.slug}`
    : "/produtos";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <StorePageNav breadcrumbs={breadcrumbItems} backHref={backHref} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <ProductGallery
          images={product.images}
          socialEmbeds={product.socialEmbeds}
          productName={product.name}
        />
        <ProductPurchasePanel product={product} />
      </div>
    </div>
  );
}
