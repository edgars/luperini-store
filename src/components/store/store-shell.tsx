"use client";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { useCart } from "@/components/store/cart-provider";
import { ProductSearchOverlay } from "@/components/store/product-search-overlay";
import { ProductSearchProvider } from "@/components/store/product-search-provider";
import type { StoreNavLink } from "@/lib/store/home-config";
import type { StoreCatalogFilters } from "@/lib/store/get-store-products";
import type { SocialSettingsValue } from "@/lib/store/social-config";
import type { TypographySettingsValue } from "@/lib/store/typography-config";
import { StoreTypographyStyles } from "@/components/store/store-typography-styles";

export function StoreShell({
  children,
  navLinks,
  catalogFilters,
  socialSettings,
  typographySettings,
}: {
  children: React.ReactNode;
  navLinks: StoreNavLink[];
  catalogFilters: StoreCatalogFilters;
  socialSettings: SocialSettingsValue;
  typographySettings: TypographySettingsValue;
}) {
  const { itemCount } = useCart();

  return (
    <ProductSearchProvider catalogFilters={catalogFilters}>
      <div className="store-theme flex min-h-screen flex-col">
        <StoreTypographyStyles settings={typographySettings} />
        <StoreHeader
          cartCount={itemCount}
          navLinks={navLinks}
          socialSettings={socialSettings}
        />
        <main className="flex-1">{children}</main>
        <StoreFooter socialSettings={socialSettings} />
        <ProductSearchOverlay />
      </div>
    </ProductSearchProvider>
  );
}
