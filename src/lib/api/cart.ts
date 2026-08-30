import { apiFetch } from "./http";
import type { CartApi } from "@/types/api/cart";
import type { CartVM, CartLineVM } from "@/types/view/cart";

// Guest cart CRUD (GUIDE-INTEGRACAO/GUIA-INTEGRACAO-FRONTEND.md §4). Called
// only from the client (CartProvider) — the token lives in localStorage, not
// on the server. Unlike the read services in this folder, these DO NOT
// swallow errors: the UI needs the ApiError.code (INSUFFICIENT_STOCK, …) to
// tell the shopper what went wrong.

export interface CartResult {
  cart: CartVM;
  /** always echoed back — persist it and send it on the next call. */
  token: string;
}

function toCartVM(api: CartApi): CartVM {
  const items: CartLineVM[] = api.items.map((it) => ({
    variantId: it.variantId,
    name: it.product?.name ?? "Item no longer available",
    slug: it.product?.slug ?? null,
    brandName: it.product?.brand ?? null,
    imageUrl: it.product?.image ?? null,
    sku: it.sku,
    unitPrice: it.price,
    quantity: it.quantity,
    lineTotal: it.price * it.quantity,
    available: it.available,
    stockAvailable: it.stockAvailable,
  }));
  return {
    items,
    subtotal: api.subtotal,
    count: items.reduce((n, it) => n + it.quantity, 0),
  };
}

function cartRequest(
  path: string,
  token: string,
  init?: { method?: string; body?: string }
): Promise<CartApi> {
  return apiFetch<CartApi>(path, {
    ...init,
    headers: { "x-cart-token": token },
    revalidate: false,
  });
}

export async function getCart(token: string): Promise<CartResult> {
  const api = await cartRequest("/cart", token);
  return { cart: toCartVM(api), token: api.token };
}

// quantity >= 1. Adds to the existing quantity if the variant is already in the cart.
export async function addCartItem(
  token: string,
  variantId: string,
  quantity: number
): Promise<CartResult> {
  const api = await cartRequest("/cart/items", token, {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
  return { cart: toCartVM(api), token: api.token };
}

// quantity >= 0 — passing 0 removes the line.
export async function updateCartItem(
  token: string,
  variantId: string,
  quantity: number
): Promise<CartResult> {
  const api = await cartRequest(`/cart/items/${variantId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  return { cart: toCartVM(api), token: api.token };
}

export async function removeCartItem(token: string, variantId: string): Promise<CartResult> {
  const api = await cartRequest(`/cart/items/${variantId}`, token, { method: "DELETE" });
  return { cart: toCartVM(api), token: api.token };
}

export async function clearCart(token: string): Promise<CartResult> {
  const api = await cartRequest("/cart", token, { method: "DELETE" });
  return { cart: toCartVM(api), token: api.token };
}
