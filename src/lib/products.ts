import sneakers from "@/data/sneakers.json";
import apparel from "@/data/apparel.json";
import accessories from "@/data/accessories.json";
import type { Product, ProductCategory } from "@/types/product";
import type { ProductCardVM } from "@/types/view/product-card";
import { getAllHomeFeaturedProducts } from "@/lib/home-featured";

// Real product data extracted from the homepage's own asset folder takes
// precedence over the generic per-category mock catalog when slugs collide.
function mergeByCategory(base: Product[], overrides: Product[]): Product[] {
  const bySlug = new Map<string, Product>();
  for (const p of base) bySlug.set(p.slug, p);
  for (const p of overrides) bySlug.set(p.slug, p);
  return [...bySlug.values()];
}

const homeFeatured = getAllHomeFeaturedProducts();

const CATALOG: Record<ProductCategory, Product[]> = {
  sneakers: mergeByCategory(
    sneakers as Product[],
    homeFeatured.filter((p) => p.category === "sneakers")
  ),
  apparel: mergeByCategory(
    apparel as Product[],
    homeFeatured.filter((p) => p.category === "apparel")
  ),
  accessories: mergeByCategory(
    accessories as Product[],
    homeFeatured.filter((p) => p.category === "accessories")
  ),
};

export const CATEGORIES: { slug: ProductCategory; label: string }[] = [
  { slug: "sneakers", label: "Sneakers" },
  { slug: "apparel", label: "Apparel" },
  { slug: "accessories", label: "Accessories" },
];

export function getAllProducts(): Product[] {
  // A slug should live in exactly one category, but guard against it slipping
  // into two (e.g. differing category inference) by deduping globally too.
  const bySlug = new Map<string, Product>();
  for (const p of [...CATALOG.sneakers, ...CATALOG.apparel, ...CATALOG.accessories]) {
    bySlug.set(p.slug, p);
  }
  return [...bySlug.values()];
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return CATALOG[category] ?? [];
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getFeaturedProducts(category: ProductCategory, count = 4): Product[] {
  return getProductsByCategory(category).slice(0, count);
}

// Adapts the mock catalog's Product shape into the same ProductCardVM the
// real API integration produces, so ProductGrid/ProductCard (migrated to
// ProductCardVM for the collection-page rebuild — see
// PLANO-INTEGRACAO-ACCESSORIES.md §7) can keep rendering mock-backed pages
// (search, brand collections) unchanged. Shared here rather than duplicated
// per call site.
export function toProductCardVM(product: Product): ProductCardVM {
  const [primary, secondary] = product.images;
  return {
    id: product.slug,
    slug: product.slug,
    name: product.title,
    brandName: product.brand,
    imageUrl: primary ?? null,
    secondaryImageUrl: secondary ?? null,
    priceFrom: product.price,
  };
}
