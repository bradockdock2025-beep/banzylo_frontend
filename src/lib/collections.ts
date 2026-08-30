import { getAllProducts, CATEGORIES } from "@/lib/products";
import { BRANDS } from "@/data/brands";
import type { Product, ProductCategory } from "@/types/product";

// Brand collections only (/collections/chrome-hearts etc.) — mock catalog,
// not integrated with the real API this phase, see
// PLANO-INTEGRACAO-ACCESSORIES.md §8. Category collections
// (sneakers/apparel/accessories + subcategories) are resolved directly in
// app/collections/[handle]/page.tsx against the real GET /categories tree —
// this file used to also handle that branch against a mock CATEGORIES list,
// which is now genuinely dead code once real categories always resolve
// first, so it's been removed rather than left in place unused.

export interface BrandCollection {
  handle: string;
  title: string;
  categoryBadge: string | null;
  category: ProductCategory | null;
  products: Product[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function majorityCategory(products: Product[]): ProductCategory | null {
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0] as ProductCategory;
}

export function getAllBrandHandles(): string[] {
  return BRANDS.map((b) => b.slug);
}

export function getBrandCollection(handle: string): BrandCollection | null {
  const brand = BRANDS.find((b) => b.slug === handle);
  if (!brand) return null;

  const products = getAllProducts().filter((p) => slugify(p.brand) === handle);
  const resolvedCategory = majorityCategory(products);
  const badge = resolvedCategory ? CATEGORIES.find((c) => c.slug === resolvedCategory)?.label ?? null : null;

  return {
    handle,
    title: brand.name,
    categoryBadge: badge,
    category: resolvedCategory,
    products,
  };
}
