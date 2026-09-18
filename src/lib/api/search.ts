import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { ProductsResponseApi } from "@/types/api/catalog";
import type { ProductCardVM } from "@/types/view/product-card";

// Local-first search (2026-09-18 direction): typing on /search must never
// hit the network per keystroke — instead the WHOLE catalog is fetched once
// (274 products today, confirmed live to fit in a single request/page —
// GET /products with no categoryId returns everything) and filtered
// in-memory client-side. See lib/search-index.ts for the cache that wraps
// this. Same endpoint/shape catalog.ts's getProducts already uses per
// category, just without the categoryId filter.
const SEARCH_INDEX_LIMIT = 500;

export async function getSearchIndexProducts(): Promise<ProductCardVM[]> {
  try {
    const res = await apiFetch<ProductsResponseApi>(`/products?page=1&limit=${SEARCH_INDEX_LIMIT}`, {
      revalidate: REVALIDATE.search,
    });
    return res.data.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brandName: item.brand?.name ?? null,
      imageUrl: item.image,
      priceFrom: item.priceFrom,
    }));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getSearchIndexProducts failed:", err);
    return [];
  }
}
