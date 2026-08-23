// No "featured on home" flag exists in the backend (confirmed in
// GUIA-INTEGRACAO-HOMEPAGE.md §10) — curated order matches the real
// hypmiami.com homepage section order.
export const CURATED_BRAND_SECTIONS = [
  { slug: "chrome-hearts", heading: "Chrome Hearts" },
  { slug: "satoshi-nakamoto", heading: "Satoshi Nakamoto" },
  { slug: "paly-hollywood", heading: "Paly Hollywood" },
  { slug: "vale-forever", heading: "Vale Forever" },
  { slug: "enfants-riches-deprimes", heading: "Enfants Riches Déprimés" },
  { slug: "bottega-desires", heading: "Bottega Desires" },
] as const;
