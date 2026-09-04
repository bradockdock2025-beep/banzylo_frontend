import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { ProductListItemApi, ProductsResponseApi } from "@/types/api/catalog";
import type { ProductCardVM } from "@/types/view/product-card";

// Home brand carousels — GET /products?brand=<slug>. Since 2026-09-03 the grid
// item carries `slug` and the expanded `brand` (RELATORIO-BACKEND-PERFORMANCE
// P1/P2), so the cards link straight to the PDP with a single call — the
// previous GET /search?brand= workaround (added only to recover the slug) is
// gone. The grid item has one `image` and no `images[]`, so no hover image.

export interface BrandSectionRef {
  slug: string;
  heading: string;
}

function toProductCardVM(item: ProductListItemApi, fallbackBrand: string): ProductCardVM {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    brandName: item.brand?.name ?? fallbackBrand,
    imageUrl: item.image,
    priceFrom: item.priceFrom,
  };
}

export async function getBrandCarousel(
  slug: string,
  heading: string,
  limit = 6
): Promise<ProductCardVM[]> {
  try {
    const res = await apiFetch<ProductsResponseApi>(
      `/products?brand=${encodeURIComponent(slug)}&limit=${limit}&sort=featured`,
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
