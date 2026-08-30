// Extracted verbatim from the real hypmiami.com FOOTWEAR > "Mens / Womens Size" flyout.
export const SNEAKER_SIZES: string[] = [
  "3.5 Mens / 5 Womens",
  "4 Mens / 5.5 Womens",
  "4.5 Mens / 6 Womens",
  "5 Mens / 6.5 Womens",
  "5.5 Mens / 7 Womens",
  "6 Mens / 7.5 Womens",
  "6.5 Mens / 8 Womens",
  "7 Mens / 8.5 Womens",
  "7.5 Mens / 9 Womens",
  "8 Mens / 9.5 Womens",
  "8.5 Mens / 10 Womens",
  "9 Mens / 10.5 Womens",
  "9.5 Mens / 11 Womens",
  "10 Mens / 11.5 Womens",
  "10.5 Mens / 12 Womens",
  "11 Mens / 12.5 Womens",
  "12 Mens / 13.5 Womens",
  "12.5 Mens / 14 Womens",
  "13 Mens / 14.5 Womens",
  "13.5 Mens / 15 Womens",
  "14 Mens / 15.5 Womens",
  "14.5 Mens / 16 Womens",
  "15 Mens / 16.5 Womens",
  "15.5 Mens / 17 Womens",
  "16 Mens / 17.5 Womens",
];

// Apparel size grade — the same xs–xxl grade the `size_apparel` catalog
// facet exposes (GUIA-INTEGRACAO-FILTRO-SIZE.md §2). Used by the product
// detail page's size selector when a product is in the apparel category.
export const APPAREL_SIZES: string[] = ["XS", "S", "M", "L", "XL", "XXL"];

// Accessories aren't sized in this catalog (GUIA-INTEGRACAO-FILTRO-SIZE.md
// §1) — the selector still renders a single explicit option.
export const ONE_SIZE: string[] = ["One Size"];

// Picks the size list for a product's category, mirroring the same
// per-category split the catalog facets use (size_men/… vs size_apparel vs
// none).
export function sizesForCategory(category: "sneakers" | "apparel" | "accessories"): string[] {
  if (category === "sneakers") return SNEAKER_SIZES;
  if (category === "apparel") return APPAREL_SIZES;
  return ONE_SIZE;
}
