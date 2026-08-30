// Shape of the cart endpoints, confirmed live against http://localhost:3000
// on 2026-08-30. Identical body for GET/POST/PATCH/DELETE /cart* — always
// carries the resolved `token` (the cross-origin response also sends it in
// the `x-cart-token` header, but that header isn't in
// Access-Control-Expose-Headers, so the browser reads it from the body).
// See GUIDE-INTEGRACAO/GUIA-INTEGRACAO-FRONTEND.md §4.

export interface CartItemProductApi {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  brand: string | null;
}

export interface CartItemApi {
  variantId: string;
  quantity: number;
  /** false when the variant went inactive/away — item stays in the cart, product may be null. */
  available: boolean;
  sku: string | null;
  price: number;
  stockAvailable: number;
  product: CartItemProductApi | null;
}

export interface CartApi {
  token: string;
  items: CartItemApi[];
  subtotal: number;
  updatedAt: string;
}
