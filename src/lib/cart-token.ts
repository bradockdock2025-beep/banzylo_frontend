// The guest cart is keyed by an opaque token (Redis, 7-day TTL) that the
// backend does NOT set as a cookie — the frontend persists it and sends it
// back on every /cart* call (GUIDE-INTEGRACAO/GUIA-INTEGRACAO-FRONTEND.md §4).
// localStorage access is guarded the same way as RecentlyViewed.

const KEY = "hyp:cart-token";

export function readCartToken(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeCartToken(token: string): void {
  try {
    if (token) window.localStorage.setItem(KEY, token);
  } catch {
    // storage unavailable — cart still works for this page load, just not persisted
  }
}

export function clearStoredCartToken(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
