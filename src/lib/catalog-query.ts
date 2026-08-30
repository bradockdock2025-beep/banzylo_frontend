// URL/state <-> catalog API params translation. Since
// Correcao-da-Collection-Page.md, the URL is only read once (initial/deep-link
// load, see parseFilterSearchParams + lib/catalog-local.ts's
// parseLocalFilterState) — ongoing filter state lives in CollectionBody.tsx,
// not the URL. This file's other job, buildCatalogQueryString, is the exact
// query-string shape the backend expects and is unrelated to that change.

export const SORT_VALUES = ["featured", "price_asc", "price_desc", "newest", "relevance"] as const;
export type CatalogSort = (typeof SORT_VALUES)[number];

export interface CatalogQueryParams {
  categoryId: string;
  /** Brand slugs — sent to the API as a single CSV param. */
  brand: string[];
  /** Already "key:value" pairs, CSV-joined into one string when built into a request — see buildCatalogQueryString. Confirmed live (2026-08-23): repeated `facets=` params are rejected with 400, only a single CSV string is accepted. */
  facets: string[];
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  sort?: CatalogSort;
  inStock?: boolean;
}

const DEFAULT_LIMIT = 12;

// Query keys that are NOT facet keys — everything else in the URL is treated
// as a dynamic facet (facets vary per category, confirmed live: Accessories
// only has "color", Sneakers/Apparel also have "gender" — never hardcode
// facet key names here).
const RESERVED_KEYS = new Set(["brand", "page", "limit", "sort", "minPrice", "maxPrice", "inStock"]);

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstOrValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toCsvArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(",");
  return raw.map((v) => v.trim()).filter(Boolean);
}

function isValidSort(value: unknown): value is CatalogSort {
  return typeof value === "string" && (SORT_VALUES as readonly string[]).includes(value);
}

export function parseFilterSearchParams(
  searchParams: RawSearchParams,
  categoryId: string
): CatalogQueryParams {
  const brand = toCsvArray(searchParams.brand);

  const facets = Object.entries(searchParams)
    .filter(([key]) => !RESERVED_KEYS.has(key))
    .flatMap(([key, value]) => toCsvArray(value).map((v) => `${key}:${v}`));

  const pageRaw = firstOrValue(searchParams.page);
  const limitRaw = firstOrValue(searchParams.limit);
  const minPriceRaw = firstOrValue(searchParams.minPrice);
  const maxPriceRaw = firstOrValue(searchParams.maxPrice);
  const sortRaw = firstOrValue(searchParams.sort);
  const inStockRaw = firstOrValue(searchParams.inStock);

  const page = Math.max(1, Number(pageRaw) || 1);
  const limit = Number(limitRaw) > 0 ? Number(limitRaw) : DEFAULT_LIMIT;

  return {
    categoryId,
    brand,
    facets,
    minPrice: minPriceRaw ? Number(minPriceRaw) : undefined,
    maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
    page,
    limit,
    sort: isValidSort(sortRaw) ? sortRaw : undefined,
    inStock: inStockRaw === "true" ? true : undefined,
  };
}

// Builds the exact query string the backend expects: brand and facets are
// each a single CSV param (confirmed live — facets specifically rejects
// repeated params with 400, only accepts one comma-joined string).
export function buildCatalogQueryString(params: CatalogQueryParams): string {
  const qs = new URLSearchParams();
  qs.set("categoryId", params.categoryId);
  if (params.brand.length > 0) qs.set("brand", params.brand.join(","));
  if (params.facets.length > 0) qs.set("facets", params.facets.join(","));
  if (params.minPrice !== undefined) qs.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set("maxPrice", String(params.maxPrice));
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  if (params.sort) qs.set("sort", params.sort);
  if (params.inStock !== undefined) qs.set("inStock", String(params.inStock));
  return qs.toString();
}

