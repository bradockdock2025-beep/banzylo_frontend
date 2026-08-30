import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { SearchProductApi, SearchResponseApi } from "@/types/api/search";
import type { ProductCardVM } from "@/types/view/product-card";

// Home brand carousels. Uses GET /search?brand=<slug> instead of
// GET /products?brand=<slug> specifically because /search returns the
// product `slug` (and `images[]`/`variants[]`), so the cards are clickable
// straight to the PDP — the grid endpoint (/products) never returns a slug
// (PLANO-INTEGRACAO-HOMEPAGE.md §5.7). Brand name isn't expanded by /search,
// so it comes from the curated section heading passed in.

export interface BrandSectionRef {
  slug: string;
  heading: string;
}

function toProductCardVM(item: SearchProductApi, brandName: string): ProductCardVM {
  const images = [...item.images].sort((a, b) => a.position - b.position);
  const activePrices = item.variants
    .filter((v) => v.isActive)
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brandName,
    imageUrl: images[0]?.url ?? null,
    secondaryImageUrl: images[1]?.url ?? null,
    priceFrom: activePrices.length > 0 ? Math.min(...activePrices) : 0,
  };
}

export async function getBrandCarousel(
  slug: string,
  heading: string,
  limit = 6
): Promise<ProductCardVM[]> {
  try {
    const res = await apiFetch<SearchResponseApi>(
      `/search?brand=${encodeURIComponent(slug)}&limit=${limit}`,
      { revalidate: REVALIDATE.brandCarousels }
    );
    return res.data.map((item) => toProductCardVM(item, heading));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error(`getBrandCarousel(${slug}) failed:`, err);
    return [];
  }
}

export async function getBrandCarousels(
  sections: readonly BrandSectionRef[],
  limit = 6
): Promise<Record<string, ProductCardVM[]>> {
  const results = await Promise.all(
    sections.map((s) => getBrandCarousel(s.slug, s.heading, limit))
  );
  return Object.fromEntries(sections.map((s, i) => [s.slug, results[i]]));
}

// Full brand listing for the /collections/<brand-slug> "View All" page — same
// source and adapter as the home carousel, just a bigger page. `limit` is
// capped at 48 by GET /search.
export function getBrandProducts(
  slug: string,
  brandName: string,
  limit = 48
): Promise<ProductCardVM[]> {
  return getBrandCarousel(slug, brandName, Math.min(limit, 48));
}
