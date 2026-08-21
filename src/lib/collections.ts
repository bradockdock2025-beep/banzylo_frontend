import { CATEGORIES, getProductsByCategory, getAllProducts } from "@/lib/products";
import { BRANDS } from "@/data/brands";
import type { Product, ProductCategory } from "@/types/product";

export interface Collection {
  handle: string;
  title: string;
  categoryBadge: string | null;
  /** The resolved category (literal for a category collection, majority category for a brand collection). */
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

export function getAllCollectionHandles(): string[] {
  return [...CATEGORIES.map((c) => c.slug), ...BRANDS.map((b) => b.slug)];
}

export function getCollection(handle: string): Collection | null {
  const category = CATEGORIES.find((c) => c.slug === handle);
  if (category) {
    return {
      handle,
      title: category.label,
      categoryBadge: null,
      category: category.slug,
      products: getProductsByCategory(category.slug),
    };
  }

  const brand = BRANDS.find((b) => b.slug === handle);
  if (brand) {
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

  return null;
}
