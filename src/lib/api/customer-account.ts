import { apiFetch } from "./http";
import { toAddressVM } from "./customer-auth";
import type { AddressApi, ConsentApi } from "@/types/api/customer";
import type { AddressVM, ConsentVM } from "@/types/view/customer";

// Bearer-authenticated account operations (GUIA-INTEGRACAO-AUTENTICACAO.md
// §1.7-1.8) — separate from customer-auth.ts, which owns session/login
// concerns (no cookie/credentials needed here, only the access token).
// Same non-swallowing pattern as the rest of the API layer: the UI needs
// ApiError.code to react per-case (PASSWORD_INVALID, EMAIL_IN_USE, ...).
//
// A few response shapes below aren't spelled out in the guide (it documents
// behavior/errors but not always the exact success body) — marked inline.
// Where genuinely ambiguous, this follows the `{ success: boolean }` /
// updated-resource convention the *documented* endpoints in this same guide
// already use; worth a quick live check against the real response if
// something here doesn't match once there's a logged-in session to test with.

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

// Response shape genuinely branches per the guide: resend -> no documented
// body (assumed `{ success }`), already-verified -> `{ verified, emailVerifiedAt }`.
export async function requestEmailVerification(
  accessToken: string,
  redirectTo?: string
): Promise<{ verified?: boolean; emailVerifiedAt?: string; success?: boolean }> {
  return apiFetch("/customers/verify/email", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(redirectTo ? { redirectTo } : {}),
    revalidate: false,
  });
}

export async function requestPhoneVerification(
  accessToken: string,
  channel?: "sms" | "whatsapp"
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/customers/verify/phone", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(channel ? { channel } : {}),
    revalidate: false,
  });
}

export async function confirmPhoneVerification(
  accessToken: string,
  token: string
): Promise<{ verified: boolean; phoneVerifiedAt: string }> {
  return apiFetch("/customers/verify/phone/confirm", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ token }),
    revalidate: false,
  });
}

// Preference only — guide §6.4 is explicit there's no real 2FA enforcement
// at login yet. Surfaced as such in the UI, not hidden.
export async function updateMfaPreference(
  accessToken: string,
  input: { enabled: boolean; method?: "sms" | "email" | "totp" }
): Promise<{ mfaEnabled: boolean; mfaMethod: string | null }> {
  return apiFetch("/customers/mfa", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    revalidate: false,
  });
}

// Response body not documented — assumed `{ success }`, matching every
// other bare-mutation endpoint in this guide (logout, phone confirm, etc.).
export async function changePassword(
  accessToken: string,
  input: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/customers/password", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    revalidate: false,
  });
}

export async function changeEmail(
  accessToken: string,
  input: { email: string; redirectTo?: string }
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/customers/email", {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    revalidate: false,
  });
}

export async function getConsents(accessToken: string): Promise<ConsentVM[]> {
  const api = await apiFetch<ConsentApi[]>("/customers/consents", {
    headers: authHeaders(accessToken),
    revalidate: false,
  });
  return api.map((c) => ({ ...c }));
}

export async function updateConsent(
  accessToken: string,
  input: { type: "terms" | "privacy" | "marketing"; granted: boolean; version?: string; source?: string }
): Promise<ConsentVM> {
  const api = await apiFetch<ConsentApi>("/customers/consents", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    revalidate: false,
  });
  return { ...api };
}

// Full data dump (profile/addresses/orders/carts/consents) — shape isn't
// pinned down by the guide beyond "export completo", so this stays a plain
// object. Callers only need to re-serialize it for a file download, never
// read specific fields off it.
export async function exportCustomerData(accessToken: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>("/customers/export", {
    headers: authHeaders(accessToken),
    revalidate: false,
  });
}

export async function getAddresses(accessToken: string): Promise<AddressVM[]> {
  const api = await apiFetch<AddressApi[]>("/customers/addresses", {
    headers: authHeaders(accessToken),
    revalidate: false,
  });
  return api.map(toAddressVM);
}

export interface AddressInput {
  type: string;
  street: string;
  city: string;
  country: string;
  state?: string;
  zipcode?: string;
}

export async function createAddress(accessToken: string, input: AddressInput): Promise<AddressVM> {
  const api = await apiFetch<AddressApi>("/customers/addresses", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
    revalidate: false,
  });
  return toAddressVM(api);
}

export async function updateAddress(
  accessToken: string,
  id: string,
  patch: Partial<AddressInput>
): Promise<AddressVM> {
  const api = await apiFetch<AddressApi>(`/customers/addresses/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(patch),
    revalidate: false,
  });
  return toAddressVM(api);
}

export async function deleteAddress(accessToken: string, id: string): Promise<void> {
  await apiFetch<void>(`/customers/addresses/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
    revalidate: false,
  });
}
