import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import { buildCatalogQueryString, type CatalogQueryParams } from "@/lib/catalog-query";
import type {
  CatalogFiltersResponseApi,
  ProductsResponseApi,
} from "@/types/api/catalog";
import type { SearchResponseApi } from "@/types/api/search";
import type { ProductCardVM } from "@/types/view/product-card";
import type { CatalogFiltersVM } from "@/types/view/catalog-filters";

export interface ProductListResult {
  items: ProductCardVM[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface SlugEntry {
  slug: string;
  secondaryImageUrl: string | null;
}

const SEARCH_PAGE_LIMIT = 48; // GET /search caps `limit` at 48
const SEARCH_MAX_PAGES = 5; // safety ceiling (~240 items) for slug enrichment

// GET /products (the grid) never returns a product `slug`, so its cards can't
// link to the PDP. GET /search — same filters, same result set — DOES return
// `slug` (but not the expanded brand). So we fetch both and merge by `id`:
// slug + secondary image from /search, everything else from /products. A
// /search failure just degrades to non-linked cards (the old behavior).
async function fetchSlugMap(params: CatalogQueryParams): Promise<Map<string, SlugEntry>> {
  const map = new Map<string, SlugEntry>();
  if (!params.categoryId && params.brand.length === 0) return map; // /search needs a filter

  const query = (page: number) => {
    const qs = new URLSearchParams();
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.brand.length > 0) qs.set("brand", params.brand.join(","));
    if (params.facets.length > 0) qs.set("facets", params.facets.join(","));
    if (params.minPrice !== undefined) qs.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice));
    if (params.inStock !== undefined) qs.set("inStock", String(params.inStock));
    qs.set("page", String(page));
    qs.set("limit", String(SEARCH_PAGE_LIMIT));
    return qs.toString();
  };

  const absorb = (res: SearchResponseApi) => {
    for (const item of res.data) {
      const images = [...item.images].sort((a, b) => a.position - b.position);
      map.set(item.id, { slug: item.slug, secondaryImageUrl: images[1]?.url ?? null });
    }
  };

  const first = await apiFetch<SearchResponseApi>(`/search?${query(1)}`, {
    revalidate: REVALIDATE.catalogProducts,
  });
  absorb(first);

  const wantedPages = Math.ceil(
    Math.min(params.limit || SEARCH_PAGE_LIMIT, SEARCH_MAX_PAGES * SEARCH_PAGE_LIMIT) / SEARCH_PAGE_LIMIT
  );
  const pages = Math.min(first.meta.totalPages ?? 1, wantedPages, SEARCH_MAX_PAGES);
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) =>
        apiFetch<SearchResponseApi>(`/search?${query(i + 2)}`, { revalidate: REVALIDATE.catalogProducts })
      )
    );
    rest.forEach(absorb);
  }
  return map;
}

// GET /products — the grid. Same params object also drives getCatalogFilters
// (see below), so the two are structurally impossible to call with different
// filters by accident (PLANO-INTEGRACAO-ACCESSORIES.md §2/§4).
export async function getProducts(params: CatalogQueryParams): Promise<ProductListResult> {
  try {
    const [res, slugMap] = await Promise.all([
      apiFetch<ProductsResponseApi>(`/products?${buildCatalogQueryString(params)}`, {
        revalidate: REVALIDATE.catalogProducts,
      }),
      fetchSlugMap(params).catch(() => new Map<string, SlugEntry>()),
    ]);

    const items: ProductCardVM[] = res.data.map((item) => {
      const extra = slugMap.get(item.id);
      return {
        id: item.id,
        slug: extra?.slug ?? null,
        name: item.name,
        brandName: item.brand?.name ?? null,
        imageUrl: item.image,
        secondaryImageUrl: extra?.secondaryImageUrl ?? null,
        priceFrom: item.priceFrom,
      };
    });

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
