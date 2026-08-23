// Client-only guest cart token persistence. Not httpOnly on purpose — this
// is a guest cart identifier (per the API's x-cart-token header contract),
// not a credential, and the client needs to read/attach it itself.
const COOKIE_NAME = "cart_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getCartToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export function setCartToken(token: string): void {
  if (typeof document === "undefined" || !token) return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax`;
}
