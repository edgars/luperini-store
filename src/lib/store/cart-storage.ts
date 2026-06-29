import { calculateCouponDiscount } from "@/lib/store/coupon-utils";
import type { AppliedCartCoupon, CartItem, CartState } from "@/lib/store/cart-types";

export const CART_STORAGE_KEY = "luperini-cart";

function normalizeCartState(raw: unknown): CartState {
  if (!raw || typeof raw !== "object") {
    return { items: [] };
  }

  const state = raw as Partial<CartState>;
  const items = Array.isArray(state.items) ? state.items : [];
  const appliedCoupon =
    state.appliedCoupon && typeof state.appliedCoupon === "object"
      ? (state.appliedCoupon as AppliedCartCoupon)
      : null;

  return {
    items,
    appliedCoupon,
  };
}

export function readCart(): CartState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    return normalizeCartState(JSON.parse(raw));
  } catch {
    return { items: [] };
  }
}

export function writeCart(state: CartState) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function getCartDiscount(
  items: CartItem[],
  appliedCoupon: AppliedCartCoupon | null | undefined,
) {
  if (!appliedCoupon) return 0;
  const subtotal = getCartSubtotal(items);
  if (
    appliedCoupon.minOrderValue !== null &&
    subtotal < appliedCoupon.minOrderValue
  ) {
    return 0;
  }
  return calculateCouponDiscount(appliedCoupon, subtotal);
}

export function isAppliedCouponValid(
  items: CartItem[],
  appliedCoupon: AppliedCartCoupon | null | undefined,
) {
  if (!appliedCoupon) return false;
  const subtotal = getCartSubtotal(items);
  if (subtotal <= 0) return false;
  if (
    appliedCoupon.minOrderValue !== null &&
    subtotal < appliedCoupon.minOrderValue
  ) {
    return false;
  }
  return getCartDiscount(items, appliedCoupon) > 0;
}

export function addCartItem(items: CartItem[], incoming: CartItem): CartItem[] {
  const existing = items.find((item) => item.variantId === incoming.variantId);

  if (existing) {
    return items.map((item) =>
      item.variantId === incoming.variantId
        ? { ...item, quantity: item.quantity + incoming.quantity }
        : item,
    );
  }

  return [...items, incoming];
}
