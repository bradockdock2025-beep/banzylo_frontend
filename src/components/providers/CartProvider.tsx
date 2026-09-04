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
import type { CartVM, CartLineVM } from "@/types/view/cart";
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

function recomputeCart(items: CartLineVM[]): CartVM {
  return {
    items,
    subtotal: items.reduce((sum, it) => sum + it.lineTotal, 0),
    count: items.reduce((sum, it) => sum + it.quantity, 0),
  };
}

// Puts one line back the way it was — applied against whatever the cart
// looks like *at rollback time* (never a stale snapshot), since a sibling
// line's request may have legitimately resolved in the meantime and a
// wholesale restore would clobber that unrelated change too.
function revertLine(
  cart: CartVM | null,
  variantId: string,
  previousLine: CartLineVM | undefined
): CartVM | null {
  if (!cart) return cart;
  const withoutLine = cart.items.filter((it) => it.variantId !== variantId);
  return recomputeCart(previousLine ? [...withoutLine, previousLine] : withoutLine);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef("");
  const [cart, setCart] = useState<CartVM | null>(null);
  const cartRef = useRef<CartVM | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // setCart wrapper that keeps cartRef in sync so the optimistic mutations
  // below (setItemQuantity/removeItem) can read the *current* cart from a
  // stable useCallback without depending on `cart` (which would defeat their
  // rollback-against-latest-state logic — see revertLine above).
  const updateCart = useCallback((next: CartVM | null | ((prev: CartVM | null) => CartVM | null)) => {
    setCart((prev) => {
      const resolved = typeof next === "function" ? (next as (p: CartVM | null) => CartVM | null)(prev) : next;
      cartRef.current = resolved;
      return resolved;
    });
  }, []);

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
        updateCart(fresh);
      })
      .catch(() => {
        // token expired / rejected — drop it so the next add starts clean
        clearStoredCartToken();
        tokenRef.current = "";
      });
  }, [updateCart]);

  // Pessimistic path — still used by addItem/emptyCart, both one-off actions
  // with their own explicit "in progress" affordance (the PDP's "Adding…"
  // button state), unlike the quantity stepper this doesn't cover anymore.
  const run = useCallback(
    async (op: (token: string) => Promise<CartResult>) => {
      setIsBusy(true);
      setError(null);
      try {
        const { cart: fresh, token } = await op(tokenRef.current);
        tokenRef.current = token;
        writeCartToken(token);
        updateCart(fresh);
      } catch (err) {
        setError(messageFor(err));
        throw err;
      } finally {
        setIsBusy(false);
      }
    },
    [updateCart]
  );

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

  // Optimistic: the stepper reflects the new quantity the instant it's
  // clicked — the ~2-3s backend round-trip (see
  // RELATORIO-BACKEND-PERFORMANCE-RESPOSTA.md) happens in the background and
  // only reconciles or rolls back this one line, never the whole cart.
  const setItemQuantity = useCallback(
    async (variantId: string, quantity: number) => {
      const clamped = Math.max(0, quantity);
      const current = cartRef.current;
      if (!current) return;
      const previousLine = current.items.find((it) => it.variantId === variantId);

      setError(null);
      const optimisticItems =
        clamped === 0
          ? current.items.filter((it) => it.variantId !== variantId)
          : current.items.map((it) =>
              it.variantId === variantId ? { ...it, quantity: clamped, lineTotal: it.unitPrice * clamped } : it
            );
      updateCart(recomputeCart(optimisticItems));

      try {
        const { cart: fresh, token } = await updateCartItem(tokenRef.current, variantId, clamped);
        tokenRef.current = token;
        writeCartToken(token);
        updateCart(fresh); // reconciles with server truth (stock/price may have shifted)
      } catch (err) {
        updateCart((prev) => revertLine(prev, variantId, previousLine));
        setError(messageFor(err));
      }
    },
    [updateCart]
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      const current = cartRef.current;
      if (!current) return;
      const previousLine = current.items.find((it) => it.variantId === variantId);

      setError(null);
      updateCart(recomputeCart(current.items.filter((it) => it.variantId !== variantId)));

      try {
        const { cart: fresh, token } = await removeCartItem(tokenRef.current, variantId);
        tokenRef.current = token;
        writeCartToken(token);
        updateCart(fresh);
      } catch (err) {
        updateCart((prev) => revertLine(prev, variantId, previousLine));
        setError(messageFor(err));
      }
    },
    [updateCart]
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
