// Normalized shapes the auth/account UI consumes — adapted once in
// src/lib/api/customer-auth.ts and src/lib/api/customer-account.ts from
// CustomerApi/AuthSessionApi, same api/ -> view/ split already used for
// cart/orders/catalog.

export interface AddressVM {
  id: string;
  type: string;
  street: string;
  city: string;
  country: string;
  state: string | null;
  zipcode: string | null;
}

export interface ConsentVM {
  type: "terms" | "privacy" | "marketing";
  granted: boolean;
  version: string | null;
  source: string | null;
  grantedAt: string | null;
}

export interface CustomerVM {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  mfaMethod: string | null;
  isActive: boolean;
  addresses: AddressVM[];
}

export interface AuthSessionVM {
  accessToken: string;
  expiresIn: number;
  customer: CustomerVM;
}
