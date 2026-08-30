"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartVM } from "@/types/view/cart";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  type CartResult,
} from "@/lib/api/cart";
import { ApiError } from "@/lib/api/http";
import { readCartToken, writeCartToken, clearStoredCartToken } from "@/lib/cart-token";

// Fase B (PRODUCT-DETAIL-INTEGRACAO/PLANO-INTEGRACAO-PRODUCT-DETAIL.md §8):
// the guest cart. One in-memory copy of the cart + the localStorage token,
// mounted once in the root layout so the header badge, the drawer and the
// PDP's "Add to Cart" all share it.

interface CartContextValue {
  cart: CartVM | null;
  count: number;
  isOpen: boolean;
  isBusy: boolean;
  error: string | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  setItemQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  emptyCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// Friendly copy per stable error `code` (never branch on `message`).
const ERROR_COPY: Record<string, string> = {
  INSUFFICIENT_STOCK: "Not enough stock for that quantity.",
  INVENTORY_UNAVAILABLE: "This item is currently unavailable.",
  PRESALE_LIMIT_REACHED: "Pre-order limit reached for this item.",
};

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    return (err.code && ERROR_COPY[err.code]) || err.message || "Something went wrong.";
  }
  return "Something went wrong. Please try again.";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef("");
  const [cart, setCart] = useState<CartVM | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate once — only when a token already exists. First-time visitors have
  // no cart yet (it's created lazily by the first add), so skip the call.
  useEffect(() => {
    const stored = readCartToken();
    if (!stored) return;
    tokenRef.current = stored;
    getCart(stored)
      .then(({ cart: fresh, token }) => {
        tokenRef.current = token;
        writeCartToken(token);
        setCart(fresh);
      })
      .catch(() => {
        // token expired / rejected — drop it so the next add starts clean
        clearStoredCartToken();
        tokenRef.current = "";
      });
  }, []);

  const run = useCallback(async (op: (token: string) => Promise<CartResult>) => {
    setIsBusy(true);
    setError(null);
    try {
      const { cart: fresh, token } = await op(tokenRef.current);
      tokenRef.current = token;
      writeCartToken(token);
      setCart(fresh);
    } catch (err) {
      setError(messageFor(err));
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      try {
        await run((t) => addCartItem(t, variantId, quantity));
      } finally {
        setIsOpen(true); // open the drawer on success and on error (shows the banner)
      }
    },
    [run]
  );

  const setItemQuantity = useCallback(
    (variantId: string, quantity: number) => run((t) => updateCartItem(t, variantId, Math.max(0, quantity))),
    [run]
  );

  const removeItem = useCallback(
    (variantId: string) => run((t) => removeCartItem(t, variantId)),
    [run]
  );

  const emptyCart = useCallback(() => run((t) => clearCart(t)), [run]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.count ?? 0,
      isOpen,
      isBusy,
      error,
      openDrawer: () => setIsOpen(true),
      closeDrawer: () => {
        setIsOpen(false);
        setError(null);
      },
      addItem,
      setItemQuantity,
      removeItem,
      emptyCart,
    }),
    [cart, isOpen, isBusy, error, addItem, setItemQuantity, removeItem, emptyCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
