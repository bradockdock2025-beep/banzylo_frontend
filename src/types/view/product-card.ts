// The single product shape UI components (HomeProductCard/HomeProductGrid)
// consume. Each API service adapts its own raw shape into this — components
// never import a src/types/api/* type directly.
export interface ProductCardVM {
  id: string;
  /** null when the source endpoint doesn't provide a slug (see brand-carousels.ts) — card renders without a link. */
  slug: string | null;
  name: string;
  /** null when the source endpoint doesn't expand brand (see new-arrivals.ts) — brand line is omitted, never guessed. */
  brandName: string | null;
  imageUrl: string | null;
  secondaryImageUrl?: string | null;
  priceFrom: number;
  isNew?: boolean;
  /** null when the source endpoint doesn't expose a variant to add (see brand-carousels.ts) — quick-add button is omitted, never guessed. */
  variantId: string | null;
}
