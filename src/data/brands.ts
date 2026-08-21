export interface Brand {
  slug: string;
  name: string;
  group: "footwear" | "apparel";
}

// Extracted from the real hypmiami.com header mega-menu.
// "footwear" brands are the ones listed under the FOOTWEAR > Brands flyout;
// "apparel" brands are the ones used across the Apparel/Accessories brand sections.
export const BRANDS: Brand[] = [
  { slug: "adidas", name: "Adidas", group: "footwear" },
  { slug: "asics", name: "Asics", group: "footwear" },
  { slug: "bravest-studios-shoes", name: "Bravest Studios", group: "footwear" },
  { slug: "bottega-veneta", name: "Bottega Veneta", group: "footwear" },
  { slug: "chanel-footwear", name: "Chanel", group: "footwear" },
  { slug: "converse", name: "Converse", group: "footwear" },
  { slug: "jordan", name: "Jordan", group: "footwear" },
  { slug: "maison-margiela", name: "Maison Margiela", group: "footwear" },
  { slug: "maison-mihara-yasuhiro-mmy", name: "Maison Mihara Yasuhiro", group: "footwear" },
  { slug: "marni", name: "Marni", group: "footwear" },
  { slug: "new-balance", name: "New Balance", group: "footwear" },
  { slug: "nike", name: "Nike", group: "footwear" },
  { slug: "prada-footwear", name: "Prada", group: "footwear" },
  { slug: "rick-owens", name: "Rick Owens", group: "footwear" },
  { slug: "salomon", name: "Salomon", group: "footwear" },
  { slug: "vans", name: "Vans", group: "footwear" },
  { slug: "yeezy", name: "Yeezy", group: "footwear" },
  { slug: "amiri", name: "Amiri", group: "apparel" },
  { slug: "balenciaga", name: "Balenciaga", group: "apparel" },
  { slug: "bottega-desires", name: "Bottega Desires", group: "apparel" },
  { slug: "chrome-hearts", name: "Chrome Hearts", group: "apparel" },
  { slug: "enfants-riches-deprimes", name: "Enfants Riches Déprimés", group: "apparel" },
  { slug: "fear-of-god", name: "Fear of God", group: "apparel" },
  { slug: "goyard", name: "Goyard", group: "apparel" },
  { slug: "rhude", name: "Rhude", group: "apparel" },
  { slug: "saint-michael", name: "Saint Michael", group: "apparel" },
  { slug: "satoshi-nakamoto", name: "Satoshi Nakamoto", group: "apparel" },
  { slug: "paly-hollywood", name: "Paly Hollywood", group: "apparel" },
  { slug: "vale-forever", name: "Vale Forever", group: "apparel" },
  { slug: "supreme", name: "Supreme", group: "apparel" },
  { slug: "vertabrae", name: "Vertabrae", group: "apparel" },
];

export const FOOTWEAR_BRANDS = BRANDS.filter((b) => b.group === "footwear");
