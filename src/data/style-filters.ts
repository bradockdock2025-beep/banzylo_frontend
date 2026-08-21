import type { ProductCategory } from "@/types/product";

export interface StyleOption {
  label: string;
  count: number;
}

// Extracted verbatim from the real Boost "Style" facet (id="pf_m___custom__style_type")
// present in the saved Apparel/Sneakers/Accessories collection pages, including the
// real product counts shown on hypmiami.com at scrape time.
export const STYLE_FILTERS: Record<ProductCategory, StyleOption[]> = {
  apparel: [
    { label: "Crewnecks & Sweatshirts", count: 28 },
    { label: "Hoodies", count: 185 },
    { label: "Jackets & Outerwear", count: 22 },
    { label: "Jeans & Denim", count: 91 },
    { label: "Jerseys", count: 35 },
    { label: "Long Sleeves", count: 79 },
    { label: "Pants & Trousers", count: 56 },
    { label: "Shirts", count: 11 },
    { label: "Shorts", count: 172 },
    { label: "Sleeveless", count: 42 },
    { label: "Sweatpants", count: 123 },
    { label: "T-Shirts", count: 261 },
    { label: "Underwear", count: 3 },
    { label: "Womens", count: 29 },
  ],
  sneakers: [
    { label: "Boots", count: 7 },
    { label: "Slides & Sandals", count: 50 },
    { label: "Sneakers", count: 281 },
  ],
  accessories: [
    { label: "Bags", count: 21 },
    { label: "Beanies", count: 26 },
    { label: "Belts", count: 12 },
    { label: "Bracelets", count: 4 },
    { label: "Collectibles", count: 28 },
    { label: "Glasses", count: 30 },
    { label: "Gloves", count: 1 },
    { label: "Hats & Caps", count: 71 },
    { label: "Jeans & Denim", count: 1 },
    { label: "Necklaces & Pendants", count: 22 },
    { label: "Rings", count: 15 },
    { label: "Scarves", count: 6 },
    { label: "Sneaker Care", count: 12 },
    { label: "Socks", count: 44 },
    { label: "Underwear", count: 1 },
    { label: "Wallets", count: 22 },
    { label: "Womens", count: 1 },
  ],
};
