import { CartProvider } from "@/components/store/cart-provider";
import { StoreShell } from "@/components/store/store-shell";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <StoreShell>{children}</StoreShell>
    </CartProvider>
  );
}
