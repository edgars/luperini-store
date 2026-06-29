"use client";

import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { useCart } from "@/components/store/cart-provider";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const { itemCount } = useCart();

  return (
    <div className="store-theme flex min-h-screen flex-col">
      <StoreHeader cartCount={itemCount} />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
