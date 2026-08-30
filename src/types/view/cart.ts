// Normalized cart shape the drawer / cart page consume — adapted from CartApi
// in src/lib/api/cart.ts.

export interface CartLineVM {
  variantId: string;
  name: string;
  slug: string | null;
  brandName: string | null;
  imageUrl: string | null;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  stockAvailable: number;
}

export interface CartVM {
  items: CartLineVM[];
  subtotal: number;
  /** sum of line quantities — drives the header badge. */
  count: number;
}
