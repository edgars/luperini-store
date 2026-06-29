import { FeaturedProductsSection } from "@/components/store/featured-products-section";
import { HeroSection } from "@/components/store/hero-section";
import { getFeaturedProducts } from "@/lib/store/get-featured-products";
import { getHomePageConfig } from "@/lib/store/get-home-config";

export default async function HomePage() {
  const [featuredProducts, homeConfig] = await Promise.all([
    getFeaturedProducts(),
    getHomePageConfig(),
  ]);

  return (
    <>
      <HeroSection hero={homeConfig.hero} />
      <FeaturedProductsSection products={featuredProducts} />
    </>
  );
}
