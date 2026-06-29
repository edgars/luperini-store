"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCouponCode } from "@/lib/store/coupon-utils";

export function CartCouponField() {
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  function handleApply(event: React.FormEvent) {
    event.preventDefault();

    if (!code.trim()) {
      toast.error("Informe o código do cupom.");
      return;
    }

    startTransition(async () => {
      const result = await applyCoupon(code);
      if (result.success) {
        setCode("");
        toast.success(`Cupom ${formatCouponCode(result.code)} aplicado.`);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (appliedCoupon) {
    return (
      <div className="rounded-xl border border-store-charcoal/10 bg-store-cream/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-store-sans text-[10px] uppercase tracking-[0.16em] text-store-charcoal/45">
              Cupom aplicado
            </p>
            <p className="mt-1 font-mono text-sm font-semibold uppercase text-store-charcoal">
              {formatCouponCode(appliedCoupon.code)}
            </p>
          </div>
          <button
            type="button"
            onClick={removeCoupon}
            className="font-store-sans text-[10px] uppercase tracking-[0.14em] text-store-charcoal/45 transition-opacity hover:opacity-70"
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-3">
      <label
        htmlFor="cart-coupon-code"
        className="font-store-sans text-[10px] uppercase tracking-[0.16em] text-store-charcoal/45"
      >
        Cupom de desconto
      </label>
      <div className="flex gap-2">
        <Input
          id="cart-coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="BF30"
          className="uppercase"
          disabled={pending}
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "..." : "Aplicar"}
        </Button>
      </div>
    </form>
  );
}
