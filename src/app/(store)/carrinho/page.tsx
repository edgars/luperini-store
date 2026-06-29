import { CartContents } from "@/components/store/cart-contents";
import { StorePageNav } from "@/components/store/store-page-nav";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <StorePageNav
        breadcrumbs={[{ label: "Sacola" }]}
        backHref="/produtos"
        backLabel="Continuar comprando"
      />
      <h1 className="font-store-serif text-3xl text-store-charcoal">Sacola</h1>
      <p className="mt-3 font-store-sans text-sm text-store-charcoal/60">
        Revise os itens antes de finalizar a compra.
      </p>
      <div className="mt-10">
        <CartContents />
      </div>
    </div>
  );
}
