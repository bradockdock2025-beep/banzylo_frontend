import raw from "@/data/home-featured.json";
import type { HomeFeaturedData, HomeFeaturedProduct } from "@/types/home-featured";
import type { Product, ProductCategory } from "@/types/product";

const DATA = raw as HomeFeaturedData;

// Longest-prefix brand match against real product titles pulled from hypmiami.com.
const KNOWN_BRAND_PREFIXES = [
  "Chrome Hearts",
  "Rick Owens",
  "Bravest Studios",
  "Maison Mihara Yasuhiro",
  "Maison Margiela",
  "New Balance",
  "Bottega Desires",
  "Bottega Veneta",
  "Enfants Riches Déprimés",
  "Satoshi Nakamoto",
  "Paly Hollywood",
  "Vale Forever",
  "Rhude",
  "Nike",
  "Jordan",
  "Dior",
  "ASICS",
  "Salomon",
  "Paly",
  "YZY",
].sort((a, b) => b.length - a.length);

function inferBrand(title: string): string {
  const match = KNOWN_BRAND_PREFIXES.find((b) => title.toLowerCase().startsWith(b.toLowerCase()));
  if (match) return match;
  return title.split(" ").slice(0, 2).join(" ");
}

// Brand-section products (unlike New Arrivals) don't come tagged with a real
// category, so infer one from the title rather than hardcoding "apparel" —
// otherwise rings/beanies/etc. get miscategorized as apparel.
const SNEAKER_WORDS = ["sneaker", "shoe", "slide", "boot", "runner", "trainer"];
const ACCESSORY_WORDS = [
  "ring",
  "beanie",
  "hat",
  "cap",
  "glasses",
  "wallet",
  "belt",
  "sock",
  "bag",
  "tote",
  "necklace",
  "bracelet",
  "scarf",
  "glove",
];

function inferCategory(title: string): ProductCategory {
  const lower = title.toLowerCase();
  if (SNEAKER_WORDS.some((w) => lower.includes(w))) return "sneakers";
  if (ACCESSORY_WORDS.some((w) => lower.includes(w))) return "accessories";
  return "apparel";
}

function toProduct(item: HomeFeaturedProduct, category: ProductCategory, brandOverride?: string): Product {
  return {
    slug: item.slug,
    title: item.title,
    brand: brandOverride ?? inferBrand(item.title),
    category,
    price: item.price ?? 0,
    images: item.images,
  };
}

export function getNewArrivals() {
  return {
    apparel: DATA.newArrivals.apparel.map((p) => toProduct(p, "apparel")),
    sneakers: DATA.newArrivals.sneakers.map((p) => toProduct(p, "sneakers")),
    accessories: DATA.newArrivals.accessories.map((p) => toProduct(p, "accessories")),
  };
}

export function getBrandSection(key: keyof HomeFeaturedData["brands"]) {
  const brand = DATA.brands[key];
  return {
    label: brand.label,
    products: brand.products.map((p) => toProduct(p, inferCategory(p.title), brand.label)),
  };
}

export const BRAND_SECTION_KEYS = Object.keys(DATA.brands) as Array<keyof HomeFeaturedData["brands"]>;

export function getAboutSection() {
  return DATA.about;
}

export function getAllHomeFeaturedProducts(): Product[] {
  const arrivals = getNewArrivals();
  const brandProducts = BRAND_SECTION_KEYS.flatMap((key) => getBrandSection(key).products);

  // The same real product can legitimately appear in both a New Arrivals tab
  // and its brand section — dedupe by slug so it only ever occupies one
  // category bucket downstream.
  const bySlug = new Map<string, Product>();
  for (const p of [...arrivals.apparel, ...arrivals.sneakers, ...arrivals.accessories, ...brandProducts]) {
    bySlug.set(p.slug, p);
  }
  return [...bySlug.values()];
}
