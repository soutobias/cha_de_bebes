"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY, MAX_ITEM_QUANTITY, type CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  attentionVersion: number;
  isReady: boolean;
  addItem: (id: number, quantity: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isStoredCart(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        Number.isInteger((item as CartItem).id) &&
        Number.isInteger((item as CartItem).quantity) &&
        (item as CartItem).quantity > 0 &&
        (item as CartItem).quantity <= MAX_ITEM_QUANTITY,
    )
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [attentionVersion, setAttentionVersion] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let storedItems: CartItem[] = [];

    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart: unknown = storedCart ? JSON.parse(storedCart) : [];

      if (isStoredCart(parsedCart)) {
        storedItems = parsedCart;
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }

    const timeout = window.setTimeout(() => {
      setItems(storedItems);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const addItem = useCallback((id: number, quantity: number) => {
    const safeQuantity = Math.min(
      MAX_ITEM_QUANTITY,
      Math.max(1, Math.trunc(quantity)),
    );

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id);

      if (!existingItem) {
        return [...currentItems, { id, quantity: safeQuantity }];
      }

      return currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(
                MAX_ITEM_QUANTITY,
                item.quantity + safeQuantity,
              ),
            }
          : item,
      );
    });
    setAttentionVersion((version) => version + 1);
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      return;
    }

    const safeQuantity = Math.min(MAX_ITEM_QUANTITY, Math.trunc(quantity));
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      attentionVersion,
      isReady,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      attentionVersion,
      isReady,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
