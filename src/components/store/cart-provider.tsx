"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addCartItem,
  getCartDiscount,
  getCartItemCount,
  getCartSubtotal,
  isAppliedCouponValid,
  readCart,
  writeCart,
} from "@/lib/store/cart-storage";
import type { AppliedCartCoupon, CartItem } from "@/lib/store/cart-types";

type ApplyCouponResult =
  | { success: true; code: string }
  | { success: false; error: string };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: AppliedCartCoupon | null;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<ApplyCouponResult>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCartCoupon | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const cart = readCart();
    setItems(cart.items);
    setAppliedCoupon(cart.appliedCoupon ?? null);
    setIsReady(true);
  }, []);

  const persist = useCallback(
    (nextItems: CartItem[], nextCoupon: AppliedCartCoupon | null = appliedCoupon) => {
      setItems(nextItems);
      setAppliedCoupon(nextCoupon);
      writeCart({ items: nextItems, appliedCoupon: nextCoupon });
    },
    [appliedCoupon],
  );

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const discount = useMemo(
    () =>
      isAppliedCouponValid(items, appliedCoupon)
        ? getCartDiscount(items, appliedCoupon)
        : 0,
    [items, appliedCoupon],
  );
  const total = Math.max(subtotal - discount, 0);

  useEffect(() => {
    if (!isReady || !appliedCoupon) return;
    if (!isAppliedCouponValid(items, appliedCoupon)) {
      setAppliedCoupon(null);
      writeCart({ items, appliedCoupon: null });
    }
  }, [items, appliedCoupon, isReady]);

  const addItem = useCallback(
    (item: CartItem) => {
      const nextItems = addCartItem(items, item);
      persist(nextItems, appliedCoupon);
    },
    [items, appliedCoupon, persist],
  );

  const removeItem = useCallback(
    (variantId: string) => {
      const nextItems = items.filter((item) => item.variantId !== variantId);
      persist(nextItems, appliedCoupon);
    },
    [items, appliedCoupon, persist],
  );

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(variantId);
        return;
      }

      const nextItems = items.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item,
      );
      persist(nextItems, appliedCoupon);
    },
    [items, appliedCoupon, persist, removeItem],
  );

  const clearCart = useCallback(() => {
    persist([], null);
  }, [persist]);

  const applyCoupon = useCallback(
    async (code: string): Promise<ApplyCouponResult> => {
      try {
        const response = await fetch("/api/store/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            subtotalCents: getCartSubtotal(items),
          }),
        });

        const data = (await response.json()) as
          | {
              code: string;
              couponId: string;
              type: "percentage" | "fixed";
              value: number;
              minOrderValue: number | null;
            }
          | { error: string };

        if (!response.ok) {
          return {
            success: false,
            error: "error" in data ? data.error : "Cupom inválido.",
          };
        }

        if (!("couponId" in data)) {
          return { success: false, error: "Cupom inválido." };
        }

        const nextCoupon: AppliedCartCoupon = {
          code: data.code,
          couponId: data.couponId,
          type: data.type,
          value: data.value,
          minOrderValue: data.minOrderValue,
        };

        persist(items, nextCoupon);
        return { success: true, code: data.code };
      } catch {
        return { success: false, error: "Não foi possível validar o cupom." };
      }
    },
    [items, persist],
  );

  const removeCoupon = useCallback(() => {
    persist(items, null);
  }, [items, persist]);

  const value = useMemo(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      isReady,
      subtotal,
      discount,
      total,
      appliedCoupon: discount > 0 ? appliedCoupon : null,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      isReady,
      subtotal,
      discount,
      total,
      appliedCoupon,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
