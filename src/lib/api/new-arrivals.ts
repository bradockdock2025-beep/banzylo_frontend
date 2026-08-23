import { apiFetch } from "./http";
import { REVALIDATE, NEW_ARRIVALS_CATEGORY_IDS } from "./config";
import type { NewArrivalApi, NewArrivalsResponseApi } from "@/types/api/new-arrival";
import type { ProductCardVM } from "@/types/view/product-card";
import type { HomeCategoryKey } from "@/types/view/home-category";

const NEW_ARRIVALS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface NewArrivalsTabResult {
  products: ProductCardVM[];
  /** false when the API decided there aren't enough products (< 4) to justify showing this tab. */
  visible: boolean;
}

function toProductCardVM(item: NewArrivalApi): ProductCardVM {
  const sortedImages = [...item.images].sort((a, b) => a.position - b.position);
  const activeVariants = item.variants.filter((v) => v.isActive);
  const activePrices = activeVariants.map((v) => Number(v.price));
  // Quick-add has no size/variant picker on the real site — default to the
  // first purchasable variant.
  const quickAddVariant = activeVariants.find((v) => v.isAvailable) ?? null;

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    variantId: quickAddVariant?.id ?? null,
    // Gap confirmed in GUIA-INTEGRACAO-HOMEPAGE.md §8: this endpoint only
    // returns brandId, never an expanded `brand`. Omit rather than guess —
    // see PLANO-INTEGRACAO-HOMEPAGE.md §5.5 for why a client-side brandId
    // dictionary isn't a viable workaround.
    brandName: null,
    imageUrl: sortedImages[0]?.url ?? null,
    secondaryImageUrl: sortedImages[1]?.url ?? null,
    priceFrom: activePrices.length > 0 ? Math.min(...activePrices) : 0,
    isNew: Date.now() - new Date(item.createdAt).getTime() < NEW_ARRIVALS_WINDOW_MS,
  };
}

async function fetchTab(categoryId: string): Promise<NewArrivalsTabResult> {
  try {
    const res = await apiFetch<NewArrivalsResponseApi>(
      `/products/new-arrivals?categoryId=${categoryId}&limit=6`,
      { revalidate: REVALIDATE.newArrivals }
    );
    return { products: res.data.map(toProductCardVM), visible: res.meta.visible };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getNewArrivals tab failed:", err);
    return { products: [], visible: false };
  }
}

export async function getNewArrivals(): Promise<Record<HomeCategoryKey, NewArrivalsTabResult>> {
  const [apparel, sneakers, accessories] = await Promise.all([
    fetchTab(NEW_ARRIVALS_CATEGORY_IDS.apparel),
    fetchTab(NEW_ARRIVALS_CATEGORY_IDS.sneakers),
    fetchTab(NEW_ARRIVALS_CATEGORY_IDS.accessories),
  ]);

  return { apparel, sneakers, accessories };
}
