// The normalized product-detail shape the PDP components consume — adapted
// once from ProductDetailApi in src/lib/api/product-detail.ts, so components
// never touch string prices, nested facetValues, or unsorted images.

export interface ProductVariantVM {
  /** variant.id — the value that feeds the cart and Make Offer later. */
  id: string;
  /** facetValue.label of the size facet ("EU 42" | "S"); "" when the product isn't sized. */
  sizeLabel: string;
  /** size_men | size_women | size_kids | size_apparel — or null. */
  sizeFacetKey: string | null;
  price: number;
  compareAtPrice: number | null;
  available: boolean;
  availableQuantity: number;
  purchaseMode: "normal" | "presale" | "sold_out" | "presale_sold_out" | string;
  /** The half after "/" in variant.title ("S / New" -> "New"); null when title has no condition. */
  condition: string | null;
}

export interface ProductFacetVM {
  key: string;
  name: string;
  label: string;
}

export interface ProductDetailVM {
  id: string;
  slug: string;
  name: string;
  brandName: string | null;
  brandSlug: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  description: string | null;
  /** images sorted by position -> url. */
  images: string[];
  /** min price across active variants (the "from" price). */
  priceFrom: number;
  /** min compareAtPrice across active variants, or null when none is discounted. */
  compareAtPriceFrom: number | null;
  variants: ProductVariantVM[];
  /** Product-scoped facets, e.g. { key: "garment_type", name: "Style", label: "Sweatpants" }. */
  productFacets: ProductFacetVM[];
  inStock: boolean;
}
