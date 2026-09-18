// Non-secret hint that a customer was logged in on this browser — NOT the
// session itself (that's the HttpOnly customer_refresh_token cookie, which
// the frontend never reads/stores, per GUIA-INTEGRACAO-AUTENTICACAO.md §0/§6).
// Only decides whether CustomerAuthProvider bothers attempting a silent
// POST /customers/refresh on mount, same role cart-token.ts's stored token
// plays for the cart's hydrate-once effect.

const KEY = "hyp:customer-logged-in";

export function hasLoggedInHint(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setLoggedInHint(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // storage unavailable — session still works for this page load
  }
}

export function clearLoggedInHint(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
