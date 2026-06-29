import { CartProvider } from "@/components/store/cart-provider";
import { StoreShell } from "@/components/store/store-shell";
import { getHomePageConfig } from "@/lib/store/get-home-config";
import {
  getSocialSettings,
  getTypographySettings,
} from "@/lib/store/get-store-settings";
import { getStoreCatalogFilters } from "@/lib/store/get-store-products";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ navLinks }, catalogFilters, socialSettings, typographySettings] =
    await Promise.all([
      getHomePageConfig(),
      getStoreCatalogFilters(),
      getSocialSettings(),
      getTypographySettings(),
    ]);

  return (
    <CartProvider>
      <StoreShell
        navLinks={navLinks}
        catalogFilters={catalogFilters}
        socialSettings={socialSettings}
        typographySettings={typographySettings}
      >
        {children}
      </StoreShell>
    </CartProvider>
  );
}
