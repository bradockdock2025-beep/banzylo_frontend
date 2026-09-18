import { getSearchIndexProducts } from "./api/search";
import type { ProductCardVM } from "@/types/view/product-card";

// Plain module cache, not a Context — unlike CatalogCacheProvider (keyed per
// category, many consumers needing SSR-seeding across the tree) this is one
// flat resource with a single consumer (SearchResultsBody) plus an optional
// warm-up call (Header). Same dedupe-in-flight-request principle, simpler
// shape for a simpler need.
const TTL_MS = 60_000; // matches REVALIDATE.search

let cached: { products: ProductCardVM[]; fetchedAt: number } | null = null;
let inFlight: Promise<ProductCardVM[]> | null = null;

export function getOrFetchSearchIndex(): Promise<ProductCardVM[]> {
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return Promise.resolve(cached.products);
  }
  if (inFlight) return inFlight;

  inFlight = getSearchIndexProducts().then((products) => {
    cached = { products, fetchedAt: Date.now() };
    inFlight = null;
    return products;
  });
  return inFlight;
}

// Fire-and-forget warm-up, called from Header on mount so the index is
// usually already cached by the time someone opens /search.
export function prefetchSearchIndex(): void {
  void getOrFetchSearchIndex();
}

// search/page.tsx already resolved this via SSR for the first paint — seed
// the module cache with it so a client-side revisit within the same session
// (Home -> /search -> Home -> /search) never re-fetches.
export function seedSearchIndex(products: ProductCardVM[]): void {
  if (!cached) cached = { products, fetchedAt: Date.now() };
}
