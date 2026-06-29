"use client";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { useCart } from "@/components/store/cart-provider";
import type { StoreNavLink } from "@/lib/store/home-config";

export function StoreShell({
  children,
  navLinks,
}: {
  children: React.ReactNode;
  navLinks: StoreNavLink[];
}) {
  const { itemCount } = useCart();

  return (
    <div className="store-theme flex min-h-screen flex-col">
      <StoreHeader cartCount={itemCount} navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
