// Shape of GET /search. Confirmed live 2026-08-30: `data[]` items are full
// product objects (with `slug`, `variants[]`, `images[]`, `category`) — the
// same shape as GET /products/slug/:slug MINUS the expanded `brand` and
// MINUS the per-variant inventory/availability fields. Only the fields the
// brand carousels need are typed here; extend when the /search page is
// migrated off the mock catalog.

export interface SearchProductVariantApi {
  id: string;
  sku: string;
  title: string | null;
  /** decimal string on the wire. */
  price: string;
  compareAtPrice: string | null;
  isActive: boolean;
}

export interface SearchProductImageApi {
  url: string;
  altText: string | null;
  position: number;
}

export interface SearchProductApi {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  status: string;
  variants: SearchProductVariantApi[];
  images: SearchProductImageApi[];
}

export interface SearchResponseApi {
  data: SearchProductApi[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    query: string;
  };
}
