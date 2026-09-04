import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import { buildCatalogQueryString, type CatalogQueryParams } from "@/lib/catalog-query";
import type {
  CatalogFiltersResponseApi,
  ProductsResponseApi,
} from "@/types/api/catalog";
import type { ProductCardVM } from "@/types/view/product-card";
import type { CatalogFiltersVM } from "@/types/view/catalog-filters";

export interface ProductListResult {
  items: ProductCardVM[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// GET /products — the grid. Same params object also drives getCatalogFilters
// (see below), so the two are structurally impossible to call with different
// filters by accident (PLANO-INTEGRACAO-ACCESSORIES.md §2/§4).
//
// Since 2026-09-03 the item carries `slug` (RELATORIO-BACKEND-PERFORMANCE P1),
// so cards link straight to the PDP — the old parallel GET /search merge that
// existed only to recover slugs was removed. The grid item has a single
// `image` and no `images[]`, so there is no hover/secondary image here.
export async function getProducts(params: CatalogQueryParams): Promise<ProductListResult> {
  try {
    const res = await apiFetch<ProductsResponseApi>(
      `/products?${buildCatalogQueryString(params)}`,
      { revalidate: REVALIDATE.catalogProducts }
    );

    const items: ProductCardVM[] = res.data.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brandName: item.brand?.name ?? null,
      imageUrl: item.image,
      priceFrom: item.priceFrom,
    }));

    return { items, meta: res.meta };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getProducts failed:", err);
    return { items: [], meta: { total: 0, page: params.page, limit: params.limit, totalPages: 0 } };
  }
}

function toCatalogFiltersVM(res: CatalogFiltersResponseApi): CatalogFiltersVM {
  return {
    categoryId: res.category.id,
    categoryName: res.category.name,
    // Category/facet-value count:0 is shown, not hidden — see guide §3. Sort
    // order for categories isn't specified by the API; keep server order.
    subcategories: res.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c.count })),
    // Brands with count:0 are already excluded server-side — nothing to filter here.
    brands: res.brands.map((b) => ({ value: b.value, label: b.label, count: b.count })),
    facets: res.facets.map((f) => ({
      key: f.key,
      name: f.name,
      inputType: f.inputType,
      values: [...f.values]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((v) => ({ value: v.value, label: v.label, count: v.count })),
    })),
    priceMin: Number(res.priceMin),
    priceMax: Number(res.priceMax),
  };
}

const EMPTY_FILTERS_VM: CatalogFiltersVM = {
  categoryId: "",
  categoryName: "",
  subcategories: [],
  brands: [],
  facets: [],
  priceMin: 0,
  priceMax: 0,
};

// GET /catalog/filters — the sidebar. Must be called with the exact same
// CatalogQueryParams as getProducts (auto-exclusion: each block's counts
// reflect the other filters already applied) — see guide §3.
export async function getCatalogFilters(params: CatalogQueryParams): Promise<CatalogFiltersVM> {
  try {
    const res = await apiFetch<CatalogFiltersResponseApi>(
      `/catalog/filters?${buildCatalogQueryString(params)}`,
      { revalidate: REVALIDATE.catalogFilters }
    );
    return toCatalogFiltersVM(res);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getCatalogFilters failed:", err);
    return EMPTY_FILTERS_VM;
  }
}
