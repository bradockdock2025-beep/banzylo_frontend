// Shape of GET /products (grid) and GET /catalog/filters (sidebar).
// GET /products is the exact same endpoint used by the homepage's "shop by
// brand" carousels (?brand=) and by collection pages (?categoryId=) — see
// PLANO-INTEGRACAO-ACCESSORIES.md §5. One DTO, one adapter target for both.

export interface ProductListItemApi {
  id: string;
  name: string;
  image: string | null;
  brand: { name: string; logoUrl: string | null } | null;
  priceFrom: number;
  featured: boolean;
}

export interface ProductsResponseApi {
  data: ProductListItemApi[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface CatalogCategoryFacetApi {
  id: string;
  name: string;
  slug: string;
  code: string;
  /** Shown even at 0 — backend doesn't hide zero-count categories, see guide §3. */
  count: number;
}

export interface CatalogBrandFacetApi {
  value: string;
  label: string;
  /** Unlike categories/facet values, a brand with count 0 is never present in this array at all. */
  count: number;
}

export interface CatalogFacetValueApi {
  value: string;
  label: string;
  count: number;
  sortOrder: number;
}

export interface CatalogFacetApi {
  key: string;
  name: string;
  /** Confirmed live (2026-08-23) to include at least "checkbox" and "swatch" — treat as open-ended, never hardcode a switch of known keys. */
  inputType: string;
  values: CatalogFacetValueApi[];
}

export interface CatalogFiltersResponseApi {
  category: { id: string; name: string; slug: string };
  categories: CatalogCategoryFacetApi[];
  brands: CatalogBrandFacetApi[];
  /** Varies in length and content per category — confirmed live: Accessories has only "color", Sneakers/Apparel have "gender" + "color". Never assume a fixed set. */
  facets: CatalogFacetApi[];
  /** String on the wire, not number — Number() before use. */
  priceMin: string;
  priceMax: string;
}
