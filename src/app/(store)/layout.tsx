import Link from "next/link";

import { CartProvider } from "@/components/store/cart-provider";
import { StoreShell } from "@/components/store/store-shell";
import { getHomePageConfig } from "@/lib/store/get-home-config";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navLinks } = await getHomePageConfig();

  return (
    <CartProvider>
      <StoreShell navLinks={navLinks}>{children}</StoreShell>
    </CartProvider>
  );
}
