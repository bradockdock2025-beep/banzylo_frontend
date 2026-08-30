function requiredEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} (see .env.example)`);
  }
  return value;
}

export const API_BASE_URL = requiredEnv(
  "NEXT_PUBLIC_API_BASE_URL",
  process.env.NEXT_PUBLIC_API_BASE_URL
);

// Revalidate window (seconds) per endpoint — how "stale" each section of the
// home is allowed to get before Next.js refetches it. Tuned per how often
// each thing actually changes, not a single global value.
export const REVALIDATE = {
  announcements: 60,
  categories: 300,
  hero: 300,
  tiles: 300,
  newArrivals: 120,
  brandCarousels: 120,
  // Collection pages (grid + filter sidebar) — shorter window than the
  // homepage's showcase sections since users browsing here are closer to
  // purchase intent (stock/price changes matter more here).
  catalogProducts: 60,
  catalogFilters: 60,
} as const;

// Real category UUIDs confirmed live against the backend (2026-08-23) — see
// GUIA-INTEGRACAO-HOMEPAGE.md §8. Used to drive the 3 New Arrivals tabs.
export const NEW_ARRIVALS_CATEGORY_IDS = {
  apparel: "906bf243-dec2-4cd6-89ad-085389ddd5f4",
  sneakers: "8bc65a50-607c-4707-83c5-995ce8e5f289",
  accessories: "68cfdb28-6bfe-4ad2-b40c-1af339525322",
} as const;
