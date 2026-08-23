// Shape of GET /products?brand=<slug>&limit=&sort=featured (used by the
// homepage's 6 "shop by brand" carousels). Confirmed live against the real
// backend (2026-08-23): this response has NO `slug` field — see
// src/lib/api/brand-carousels.ts for how the UI handles the missing link target.

export interface BrandCarouselItemApi {
  id: string;
  name: string;
  image: string | null;
  brand: { name: string; logoUrl: string | null };
  priceFrom: number;
  featured: boolean;
}

export interface ProductsResponseApi {
  data: BrandCarouselItemApi[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
