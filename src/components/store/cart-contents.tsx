"use client";

import Image from "next/image";
import Link from "next/link";

import { CartCouponField } from "@/components/store/cart-coupon-field";
import { useCart } from "@/components/store/cart-provider";
import { StripePlaceholder } from "@/components/store/stripe-placeholder";
import { cn, formatCurrency } from "@/lib/utils";

export function CartContents() {
  const { items, isReady, itemCount, subtotal, discount, total, updateQuantity, removeItem } =
    useCart();

  if (!isReady) {
    return (
      <p className="font-store-sans text-sm text-store-charcoal/60">Carregando…</p>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="rounded-2xl border border-store-charcoal/10 px-6 py-12 text-center">
        <p className="font-store-sans text-sm text-store-charcoal/60">
          Sua sacola está vazia.
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-block bg-store-charcoal px-6 py-3 font-store-sans text-[10px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-store-charcoal/10">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-6 first:pt-0">
            <Link
              href={`/produtos/${item.productSlug}`}
              className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              ) : (
                <StripePlaceholder className="h-full w-full rounded-xl" />
              )}
            </Link>

            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <Link
                  href={`/produtos/${item.productSlug}`}
                  className="font-store-sans text-sm text-store-charcoal transition-opacity hover:opacity-70"
                >
                  {item.productName}
                </Link>
                {item.variantName.toLowerCase() !== "padrão" && (
                  <p className="mt-1 font-store-sans text-xs text-store-charcoal/50">
                    {item.variantName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center border border-store-charcoal/20">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="px-2.5 py-1.5 font-store-sans text-sm"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="min-w-8 px-2 py-1.5 text-center font-store-sans text-sm">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="px-2.5 py-1.5 font-store-sans text-sm"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-store-sans text-sm text-store-charcoal">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.variantId)}
                    className={cn(
                      "font-store-sans text-[10px] uppercase tracking-[0.14em]",
                      "text-store-charcoal/45 transition-opacity hover:opacity-70",
                    )}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-5 rounded-2xl border border-store-charcoal/10 p-6">
        <CartCouponField />

        <div>
          <p className="font-store-sans text-[11px] uppercase tracking-[0.16em] text-store-charcoal/45">
            Resumo
          </p>
          <div className="mt-4 space-y-3 font-store-sans text-sm">
            <div className="flex items-center justify-between">
              <span className="text-store-charcoal/60">Subtotal</span>
              <span className="text-store-charcoal">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Desconto</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-store-charcoal/10 pt-3 font-medium">
              <span className="text-store-charcoal">Total</span>
              <span className="text-store-charcoal">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled
          className="w-full bg-store-charcoal px-6 py-3.5 font-store-sans text-[10px] uppercase tracking-[0.2em] text-white opacity-50"
        >
          Finalizar compra (em breve)
        </button>
      </aside>
    </div>
  );
}
