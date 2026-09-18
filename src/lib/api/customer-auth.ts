import { apiFetch } from "./http";
import type { CustomerApi, AuthSessionApi, RegisterResponseApi, AddressApi } from "@/types/api/customer";
import type { CustomerVM, AuthSessionVM, AddressVM } from "@/types/view/customer";

// Customer auth/account (GUIA-INTEGRACAO-AUTENTICACAO.md §1). Called only
// from the client (CustomerAuthProvider) — like cart.ts/orders.ts, these DO
// NOT swallow errors: the UI needs ApiError.code (EMAIL_NOT_VERIFIED,
// AUTH_INVALID_CREDENTIALS, OTP_INVALID, ...) to react per-case.
//
// `credentials: "include"` is mandatory on every call here that touches the
// customer_refresh_token cookie (§6.2 of the guide) — omitting it means the
// browser never sends/receives the cookie and refresh silently never works.
//
// toCustomerVM/toAddressVM are exported for customer-account.ts to reuse —
// one adapter, not duplicated per file.

export function toAddressVM(api: AddressApi): AddressVM {
  return {
    id: api.id,
    type: api.type,
    street: api.street,
    city: api.city,
    country: api.country,
    state: api.state,
    zipcode: api.zipcode,
  };
}

export function toCustomerVM(api: CustomerApi): CustomerVM {
  return {
    id: api.id,
    firstName: api.firstName,
    lastName: api.lastName,
    email: api.email,
    phoneNumber: api.phoneNumber,
    emailVerified: api.emailVerifiedAt != null,
    phoneVerified: api.phoneVerifiedAt != null,
    mfaEnabled: api.mfaEnabled,
    mfaMethod: api.mfaMethod,
    isActive: api.isActive,
    addresses: (api.addresses ?? []).map(toAddressVM),
  };
}

function toSessionVM(api: AuthSessionApi): AuthSessionVM {
  return {
    accessToken: api.accessToken,
    expiresIn: api.expiresIn,
    customer: toCustomerVM(api.customer),
  };
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  phoneNumber: string;
}): Promise<RegisterResponseApi> {
  return apiFetch<RegisterResponseApi>("/customers/register", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
    revalidate: false,
  });
}

export async function loginCustomer(input: { email: string; password: string }): Promise<AuthSessionVM> {
  const api = await apiFetch<AuthSessionApi>("/customers/login", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
    revalidate: false,
  });
  return toSessionVM(api);
}

export async function requestLoginOtp(email: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>("/customers/login/otp", {
    method: "POST",
    body: JSON.stringify({ email }),
    credentials: "include",
    revalidate: false,
  });
}

// Also the endpoint that completes registration's email verification — same
// call, same response shape as login (guide §1.3).
export async function verifyLoginOtp(input: { email: string; token: string }): Promise<AuthSessionVM> {
  const api = await apiFetch<AuthSessionApi>("/customers/login/otp/verify", {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
    revalidate: false,
  });
  return toSessionVM(api);
}

// No body/header — reads customer_refresh_token straight from the cookie.
export async function refreshSession(): Promise<AuthSessionVM> {
  const api = await apiFetch<AuthSessionApi>("/customers/refresh", {
    method: "POST",
    credentials: "include",
    revalidate: false,
  });
  return toSessionVM(api);
}

export async function logoutCustomer(): Promise<void> {
  await apiFetch<{ success: boolean }>("/customers/logout", {
    method: "POST",
    credentials: "include",
    revalidate: false,
  });
}

export async function getMe(accessToken: string): Promise<CustomerVM> {
  const api = await apiFetch<CustomerApi>("/customers/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    revalidate: false,
  });
  return toCustomerVM(api);
}

export async function updateProfile(
  accessToken: string,
  patch: { firstName?: string; lastName?: string; phoneNumber?: string }
): Promise<CustomerVM> {
  const api = await apiFetch<CustomerApi>("/customers/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(patch),
    revalidate: false,
  });
  return toCustomerVM(api);
}

// "Esqueci minha senha" (guide §1.8) — public, no Bearer/cookie needed.
// Always responds 200 with generic copy regardless of whether the email
// exists (anti-enumeration by design) — never branch UI on the result here.
// Confirmed live 2026-09-18: actual body is `{ message: "Se o email
// existir, receberá um link em breve." }`, not `{ success }` — the guide
// doesn't spell out the exact shape, only that it's always 200/201. Neither
// field is read by callers (they just care whether the call threw), so this
// stays a loose/permissive type rather than one asserting a shape only
// half-confirmed.
export async function requestPasswordReset(input: {
  email: string;
  locale?: "pt" | "fr" | "en" | "es";
}): Promise<{ message?: string; success?: boolean }> {
  return apiFetch("/customers/password-reset/request", {
    method: "POST",
    body: JSON.stringify(input),
    revalidate: false,
  });
}

export async function confirmPasswordReset(input: {
  token: string;
  newPassword: string;
}): Promise<{ message?: string; success?: boolean }> {
  return apiFetch("/customers/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(input),
    revalidate: false,
  });
}
