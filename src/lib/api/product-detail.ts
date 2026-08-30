import { apiFetch, ApiError } from "./http";
import { REVALIDATE } from "./config";
import type {
  ProductDetailApi,
  ProductVariantApi,
  AlsoViewedResponseApi,
} from "@/types/api/product-detail";
import type {
  ProductDetailVM,
  ProductVariantVM,
  ProductFacetVM,
} from "@/types/view/product-detail";
import type { ProductCardVM } from "@/types/view/product-card";

// PRODUCT-DETAIL-INTEGRACAO/PLANO-INTEGRACAO-PRODUCT-DETAIL.md — the PDP's
// data always comes from the API (no mock). `revalidate` reuses the
// catalog-products window (60s), same "close to purchase intent" tuning the
// collection pages use.

function sizeFacetOf(variant: ProductVariantApi): { label: string; key: string } | null {
  const link = variant.facetValues.find((fv) =>
    fv.facetValue.facet.key.startsWith("size")
  );
  return link ? { label: link.facetValue.label, key: link.facetValue.facet.key } : null;
}

// "S / New" -> "New" ; "42" or null -> null
function conditionOf(title: string | null): string | null {
  if (!title || !title.includes("/")) return null;
  const tail = title.split("/").pop()?.trim();
  return tail ? tail : null;
}

function toVariantVM(v: ProductVariantApi): ProductVariantVM {
  const size = sizeFacetOf(v);
  return {
    id: v.id,
    sizeLabel: size?.label ?? "",
    sizeFacetKey: size?.key ?? null,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice != null ? Number(v.compareAtPrice) : null,
    available: v.isAvailable,
    availableQuantity: v.availableQuantity,
    purchaseMode: v.purchaseMode,
    condition: conditionOf(v.title),
  };
}

function toProductDetailVM(api: ProductDetailApi): ProductDetailVM {
  const variants = api.variants.filter((v) => v.isActive).map(toVariantVM);

  const activePrices = variants.map((v) => v.price).filter((n) => Number.isFinite(n) && n > 0);
  const priceFrom = activePrices.length > 0 ? Math.min(...activePrices) : 0;

  const compareAtPrices = variants
    .map((v) => v.compareAtPrice)
    .filter((n): n is number => n != null && n > 0);
  const compareAtPriceFrom = compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : null;

  const productFacets: ProductFacetVM[] = api.facetValues.map((fv) => ({
    key: fv.facetValue.facet.key,
    name: fv.facetValue.facet.name,
    label: fv.facetValue.label,
  }));

  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    brandName: api.brand?.name ?? null,
    brandSlug: api.brand?.slug ?? null,
    categoryName: api.category?.name ?? null,
    categorySlug: api.category?.slug ?? null,
    description: api.description,
    images: [...api.images].sort((a, b) => a.position - b.position).map((img) => img.url),
    priceFrom,
    compareAtPriceFrom,
    variants,
    productFacets,
    inStock: variants.some((v) => v.available),
  };
}

// GET /products/slug/:slug — the PDP's main fetch. Returns null on 404
// (page.tsx calls notFound()) and on any other failure (resilience pattern
// shared with the rest of src/lib/api/*).
export async function getProductDetail(slug: string): Promise<ProductDetailVM | null> {
  try {
    const res = await apiFetch<ProductDetailApi>(
      `/products/slug/${encodeURIComponent(slug)}`,
      { revalidate: REVALIDATE.catalogProducts }
    );
    return toProductDetailVM(res);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    if (process.env.NODE_ENV !== "production") console.error("getProductDetail failed:", err);
    return null;
  }
}

// GET /products/:id/also-viewed — recommendation rail on the PDP. Needs the
// product id (not the slug), so it's called after getProductDetail. Never
// throws — returns [] on failure, same as the homepage showcases.
export async function getAlsoViewed(productId: string, limit = 6): Promise<ProductCardVM[]> {
  try {
    const res = await apiFetch<AlsoViewedResponseApi>(
      `/products/${productId}/also-viewed?limit=${limit}`,
      { revalidate: REVALIDATE.catalogProducts }
    );
    return res.data.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      brandName: null,
      imageUrl: item.image?.url ?? null,
      priceFrom: item.price,
    }));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getAlsoViewed failed:", err);
    return [];
  }
}
