import { apiFetch, ApiError } from "./http";
import { getCartToken, setCartToken } from "./cart-token";

interface AddCartItemResponseApi {
  token: string;
}

// Quick-add from a product card — always quantity 1, no size/variant picker
// (matches the real site: the hover "+" button has no size selector, see
// GUIA-INTEGRACAO-HOMEPAGE.md §5 and the product-card__quick-add-button markup).
export async function addToCart(variantId: string): Promise<boolean> {
  try {
    const res = await apiFetch<AddCartItemResponseApi>("/cart/items", {
      method: "POST",
      headers: { "x-cart-token": getCartToken() },
      body: JSON.stringify({ variantId, quantity: 1 }),
      revalidate: false,
    });
    if (res.token) setCartToken(res.token);
    return true;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("addToCart failed:", err instanceof ApiError ? err.message : err);
    }
    return false;
  }
}
