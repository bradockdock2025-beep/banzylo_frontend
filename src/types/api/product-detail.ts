// Raw shapes of the product-detail endpoints, confirmed live against
// http://localhost:3000 on 2026-08-30 (see
// PRODUCT-DETAIL-INTEGRACAO/PLANO-INTEGRACAO-PRODUCT-DETAIL.md §3).
// Components never import these — src/lib/api/product-detail.ts adapts them
// into the view-models in src/types/view/product-detail.ts.

// --- GET /products/slug/:slug  and  GET /products/:id -----------------------

export interface ProductFacetRefApi {
  id: string;
  key: string;
  name: string;
  inputType: string;
  scope: "product" | "variant" | string;
  visibility: string;
  visibilityValue: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductFacetValueApi {
  id: string;
  facetId: string;
  value: string;
  /** Already display-formatted by the API, e.g. "EU 39", "S", "Sweatpants". */
  label: string;
  extra: Record<string, string> | null;
  sortOrder: number;
  bannerTitle: string | null;
  bannerDescription: string | null;
  isActive: boolean;
  facet: ProductFacetRefApi;
}

/** One row of `variant.facetValues[]` or top-level `product.facetValues[]`. */
export interface ProductFacetValueLinkApi {
  variantId?: string;
  productId?: string;
  facetValueId: string;
  facetValue: ProductFacetValueApi;
}

export interface ProductVariantInventoryApi {
  id: string;
  variantId: string;
  stockQuantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export interface ProductVariantApi {
  id: string;
  productId: string;
  sku: string;
  /** null on sneakers; "S / New" ("<size> / <condition>") on apparel. */
  title: string | null;
  /** Decimal string on the wire — Number() before use. */
  price: string;
  compareAtPrice: string | null;
  weightKg: number | null;
  heightCm: number | null;
  widthCm: number | null;
  depthCm: number | null;
  isActive: boolean;
  presaleEnabled: boolean;
  presalePrice: string | null;
  presaleLimit: number | null;
  expectedAvailableAt: string | null;
  createdAt: string;
  updatedAt: string;
  inventory: ProductVariantInventoryApi | null;
  /** Size lives here — facetValue.facet.key is size_men|size_women|size_kids|size_apparel. */
  facetValues: ProductFacetValueLinkApi[];
  availableQuantity: number;
  isAvailable: boolean;
  purchaseMode: "normal" | "presale" | "sold_out" | "presale_sold_out" | string;
}

export interface ProductImageApi {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryApi {
  id: string;
  name: string;
  slug: string;
  code: string;
  familyTag: string | null;
  bannerTitle: string | null;
  bannerDescription: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrandApi {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailApi {
  id: string;
  categoryId: string;
  brandId: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  featured: boolean;
  featuredUntil: string | null;
  featuredOrder: number | null;
  displayOrder: number | null;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantApi[];
  images: ProductImageApi[];
  category: ProductCategoryApi | null;
  brand: ProductBrandApi | null;
  /** Product-scoped facets (e.g. garment_type / "Style"). */
  facetValues: ProductFacetValueLinkApi[];
}

// --- GET /products/:id/also-viewed?limit=6 --------------------------------

export interface AlsoViewedItemApi {
  id: string;
  name: string;
  slug: string;
  /** number here (unlike the detail endpoint, which sends a string). */
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  inStock: boolean;
  image: { url: string; altText: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
}

export interface AlsoViewedResponseApi {
  data: AlsoViewedItemApi[];
  meta: {
    productId: string;
    total: number;
    source: string;
    fallback: boolean;
    cacheHit: boolean;
  };
}
