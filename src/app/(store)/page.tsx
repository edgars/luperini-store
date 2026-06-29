import { FeaturedProductsSection } from "@/components/store/featured-products-section";
import { HeroSection } from "@/components/store/hero-section";
import { getFeaturedProducts } from "@/lib/store/get-featured-products";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <HeroSection />
      <FeaturedProductsSection products={featuredProducts} />
    </>
  );
}
