// Shape of the customer auth/account endpoints (GUIA-INTEGRACAO-AUTENTICACAO.md
// §1). See that file's §1.2 sample JSON for the full Customer shape.

export interface AddressApi {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  state: string | null;
  zipcode: string | null;
}

export interface ConsentApi {
  type: "terms" | "privacy" | "marketing";
  granted: boolean;
  version: string | null;
  source: string | null;
  grantedAt: string | null;
}

export interface CustomerApi {
  id: string;
  authUserId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  mfaEnabled: boolean;
  mfaMethod: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: AddressApi[];
}

// POST /customers/login, /customers/login/otp/verify, /customers/refresh —
// all three return this same shape.
export interface AuthSessionApi {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  customer: CustomerApi;
}

// POST /customers/register
export interface RegisterResponseApi {
  requiresEmailVerification: boolean;
  email: string;
}
