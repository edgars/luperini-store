import type { CartItem, CartState } from "@/lib/store/cart-types";

export const CART_STORAGE_KEY = "luperini-cart";

export function readCart(): CartState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!Array.isArray(parsed.items)) return { items: [] };
    return parsed;
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
