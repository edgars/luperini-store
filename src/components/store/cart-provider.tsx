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
  getCartItemCount,
  readCart,
  writeCart,
} from "@/lib/store/cart-storage";
import type { CartItem } from "@/lib/store/cart-types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isReady: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setItems(readCart().items);
    setIsReady(true);
  }, []);

  const persist = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    writeCart({ items: nextItems });
  }, []);

  const addItem = useCallback(
    (item: CartItem) => {
      persist(addCartItem(items, item));
    },
    [items, persist],
  );

  const removeItem = useCallback(
    (variantId: string) => {
      persist(items.filter((item) => item.variantId !== variantId));
    },
    [items, persist],
  );

  const updateQuantity = useCallback(
    (variantId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(variantId);
        return;
      }

      persist(
        items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item,
        ),
      );
    },
    [items, persist, removeItem],
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const value = useMemo(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      isReady,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, isReady, addItem, removeItem, updateQuantity, clearCart],
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
