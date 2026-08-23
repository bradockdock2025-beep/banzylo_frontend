import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { BrandCarouselItemApi, ProductsResponseApi } from "@/types/api/brand-carousel-item";
import type { ProductCardVM } from "@/types/view/product-card";

function toProductCardVM(item: BrandCarouselItemApi): ProductCardVM {
  return {
    id: item.id,
    // Gap confirmed live (2026-08-23): GET /products?brand= never returns
    // `slug` — see PLANO-INTEGRACAO-HOMEPAGE.md §5.7. Card renders without a
    // clickable link rather than guessing a URL.
    slug: null,
    name: item.name,
    brandName: item.brand?.name ?? null,
    imageUrl: item.image,
    priceFrom: item.priceFrom,
    // Same class of gap as `slug`: this endpoint returns no `variants`, so
    // there's no id to add to cart — quick-add button is omitted here, not faked.
    variantId: null,
  };
}

export async function getBrandCarousel(slug: string, limit = 6): Promise<ProductCardVM[]> {
  try {
    const res = await apiFetch<ProductsResponseApi>(
      `/products?brand=${encodeURIComponent(slug)}&limit=${limit}&sort=featured`,
      { revalidate: REVALIDATE.brandCarousels }
    );
    return res.data.map(toProductCardVM);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error(`getBrandCarousel(${slug}) failed:`, err);
    return [];
  }
}

export async function getBrandCarousels(
  slugs: string[],
  limit = 6
): Promise<Record<string, ProductCardVM[]>> {
  const results = await Promise.all(slugs.map((slug) => getBrandCarousel(slug, limit)));
  return Object.fromEntries(slugs.map((slug, i) => [slug, results[i]]));
}
