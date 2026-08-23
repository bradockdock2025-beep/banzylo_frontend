// The backend's homepage content (tiles, hero CTA) links using its own
// scheme (e.g. "/products?categoryId=<uuid>" or bare "/sneakers"), which
// doesn't match this app's actual routes (/collections/[handle], slug-based).
// Per PLANO-INTEGRACAO-HOMEPAGE.md §5.2/§5.6: use the API only as a content
// source, never trust its href/ctaHref as a navigation target — resolve
// against our own known local collection slugs instead.
const LOCAL_COLLECTION_SLUGS = new Set(["sneakers", "apparel", "accessories"]);

/** Maps a known category slug or display name to this app's local /collections/<slug> route, or null if unrecognized. */
export function resolveCollectionHref(slugOrName: string): string | null {
  const key = slugOrName.trim().toLowerCase();
  return LOCAL_COLLECTION_SLUGS.has(key) ? `/collections/${key}` : null;
}

/** Best-effort resolver for a bare API path like hero.ctaHref ("/sneakers") — falls back rather than risk a dead link. */
export function resolveHeroCtaHref(apiHref: string | null | undefined, fallback: string): string {
  if (!apiHref) return fallback;
  const bare = apiHref.split("?")[0].replace(/^\/+/, "");
  return resolveCollectionHref(bare) ?? fallback;
}
