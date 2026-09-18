"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CustomerVM, AddressVM, ConsentVM } from "@/types/view/customer";
import {
  registerCustomer,
  loginCustomer,
  requestLoginOtp,
  verifyLoginOtp,
  refreshSession,
  logoutCustomer,
  updateProfile as updateProfileApi,
  requestPasswordReset as requestPasswordResetApi,
  confirmPasswordReset as confirmPasswordResetApi,
  getMe,
} from "@/lib/api/customer-auth";
import {
  requestEmailVerification as requestEmailVerificationApi,
  requestPhoneVerification as requestPhoneVerificationApi,
  confirmPhoneVerification as confirmPhoneVerificationApi,
  updateMfaPreference as updateMfaPreferenceApi,
  changePassword as changePasswordApi,
  changeEmail as changeEmailApi,
  getConsents as getConsentsApi,
  updateConsent as updateConsentApi,
  exportCustomerData,
  getAddresses as getAddressesApi,
  createAddress as createAddressApi,
  updateAddress as updateAddressApi,
  deleteAddress as deleteAddressApi,
  type AddressInput,
} from "@/lib/api/customer-account";
import { ApiError } from "@/lib/api/http";
import { hasLoggedInHint, setLoggedInHint, clearLoggedInHint } from "@/lib/customer-session";

// Customer account (GUIA-INTEGRACAO-AUTENTICACAO.md §1) — mounted once in the
// root layout alongside CartProvider, same shape/conventions (context +
// friendly error-code map + a hint-gated silent hydrate-on-mount effect).
// Deliberately separate from CartProvider: unrelated concerns (guest cart
// has no notion of an account), and the cart's `x-cart-token` must never be
// confused with a customer Bearer token (guide §6.1).

export interface CustomerAuthContextValue {
  customer: CustomerVM | null;
  /** True only during the initial mount-time session check. */
  isLoading: boolean;
  isBusy: boolean;
  error: string | null;
  register: (input: {
    email: string;
    password: string;
    phoneNumber: string;
  }) => Promise<{ requiresEmailVerification: boolean; email: string } | null>;
  login: (input: { email: string; password: string }) => Promise<boolean>;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (input: { email: string; token: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (patch: { firstName?: string; lastName?: string; phoneNumber?: string }) => Promise<boolean>;

  // Password reset ("esqueci minha senha") — public, no session required.
  requestPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (input: { token: string; newPassword: string }) => Promise<boolean>;

  // Account/security (Bearer-authenticated) — guide §1.7.
  requestEmailVerification: () => Promise<boolean>;
  requestPhoneVerification: (channel?: "sms" | "whatsapp") => Promise<boolean>;
  confirmPhoneVerification: (code: string) => Promise<boolean>;
  updateMfaPreference: (input: { enabled: boolean; method?: "sms" | "email" | "totp" }) => Promise<boolean>;
  changePassword: (input: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  changeEmail: (input: { email: string }) => Promise<boolean>;

  // Consents/export — guide §1.7.
  getConsents: () => Promise<ConsentVM[] | null>;
  updateConsent: (input: { type: "terms" | "privacy" | "marketing"; granted: boolean }) => Promise<boolean>;
  exportData: () => Promise<Record<string, unknown> | null>;

  // Saved addresses — guide §1.7.
  getAddresses: () => Promise<AddressVM[] | null>;
  createAddress: (input: AddressInput) => Promise<AddressVM | null>;
  updateAddress: (id: string, patch: Partial<AddressInput>) => Promise<AddressVM | null>;
  deleteAddress: (id: string) => Promise<boolean>;

  clearError: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

// Friendly copy per stable error `code` (never branch on `message`).
const ERROR_COPY: Record<string, string> = {
  AUTH_CREATE_FAILED: "This email is already registered.",
  AUTH_ALREADY_LINKED: "This email is already linked to another account.",
  EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
  AUTH_INVALID_CREDENTIALS: "Incorrect email or password.",
  ACCOUNT_DELETED: "This account has been deactivated.",
  OTP_INVALID: "Incorrect or expired code.",
  OTP_COOLDOWN: "Please wait a moment before requesting another code.",
  PASSWORD_INVALID: "Current password is incorrect.",
  EMAIL_VERIFICATION_REQUIRED: "Please verify your email first.",
  EMAIL_IN_USE: "This email is already in use by another account.",
  TOKEN_INVALID: "This link has expired or was already used.",
};

function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    return (err.code && ERROR_COPY[err.code]) || err.message || "Something went wrong.";
  }
  return "Something went wrong. Please try again.";
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // Access token lives in memory only (never localStorage, per guide §0/§6)
  // — a ref so the useCallback methods below can read the *current* token
  // without depending on `customer` state (same reasoning as CartProvider's
  // cartRef).
  const accessTokenRef = useRef<string | null>(null);
  const [customer, setCustomer] = useState<CustomerVM | null>(null);
  // Lazy initializer so a never-logged-in visitor starts at `false` outright
  // — only when the hint exists is there actually a check in flight.
  const [isLoading, setIsLoading] = useState(() => hasLoggedInHint());
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback((session: { accessToken: string; customer: CustomerVM } | null) => {
    accessTokenRef.current = session?.accessToken ?? null;
    setCustomer(session?.customer ?? null);
    if (session) setLoggedInHint();
    else clearLoggedInHint();
  }, []);

  // Silent session restore — only attempted when the non-secret hint says
  // this browser was logged in before; first-time/logged-out visitors skip
  // the call entirely, same gating CartProvider uses for its cart token.
  useEffect(() => {
    if (!hasLoggedInHint()) return; // isLoading already starts at `false` above
    refreshSession()
      .then((session) => applySession(session))
      .catch(() => applySession(null))
      .finally(() => setIsLoading(false));
  }, [applySession]);

  const register = useCallback(
    async (input: { email: string; password: string; phoneNumber: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        return await registerCustomer(input);
      } catch (err) {
        setError(messageFor(err));
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        applySession(await loginCustomer(input));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [applySession]
  );

  const requestOtp = useCallback(async (email: string) => {
    setIsBusy(true);
    setError(null);
    try {
      await requestLoginOtp(email);
      return true;
    } catch (err) {
      setError(messageFor(err));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (input: { email: string; token: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        applySession(await verifyLoginOtp(input));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    setIsBusy(true);
    // Best-effort — always clear local state regardless of whether the
    // server call itself succeeds (guide §1.5: it invalidates server-side,
    // but there's nothing useful to do locally if that request fails).
    await logoutCustomer().catch(() => {});
    applySession(null);
    setIsBusy(false);
  }, [applySession]);

  // Wraps any Bearer-authenticated call with the "refresh once on 401, retry
  // once" pattern (guide §1.4: "chame quando o accessToken expirar") — every
  // account method below goes through this instead of repeating the
  // try/catch that `updateProfile` used to have inline.
  const callAuthed = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      const token = accessTokenRef.current;
      if (!token) throw new ApiError("Not logged in", 401);
      try {
        return await fn(token);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const session = await refreshSession();
          applySession(session);
          return await fn(session.accessToken);
        }
        throw err;
      }
    },
    [applySession]
  );

  const updateProfile = useCallback(
    async (patch: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        setCustomer(await callAuthed((token) => updateProfileApi(token, patch)));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    setIsBusy(true);
    setError(null);
    try {
      await requestPasswordResetApi({ email });
      return true;
    } catch (err) {
      setError(messageFor(err));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const confirmPasswordReset = useCallback(
    async (input: { token: string; newPassword: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        await confirmPasswordResetApi(input);
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const requestEmailVerification = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      await callAuthed((token) => requestEmailVerificationApi(token));
      return true;
    } catch (err) {
      setError(messageFor(err));
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [callAuthed]);

  const requestPhoneVerification = useCallback(
    async (channel?: "sms" | "whatsapp") => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => requestPhoneVerificationApi(token, channel));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const confirmPhoneVerification = useCallback(
    async (code: string) => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => confirmPhoneVerificationApi(token, code));
        // Response is just { verified, phoneVerifiedAt }, not the full
        // Customer — re-fetch so `customer.phoneVerified` stays accurate.
        setCustomer(await callAuthed((token) => getMe(token)));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const updateMfaPreference = useCallback(
    async (input: { enabled: boolean; method?: "sms" | "email" | "totp" }) => {
      setIsBusy(true);
      setError(null);
      try {
        const { mfaEnabled, mfaMethod } = await callAuthed((token) => updateMfaPreferenceApi(token, input));
        setCustomer((prev) => (prev ? { ...prev, mfaEnabled, mfaMethod } : prev));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const changePassword = useCallback(
    async (input: { currentPassword: string; newPassword: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => changePasswordApi(token, input));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const changeEmail = useCallback(
    async (input: { email: string }) => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => changeEmailApi(token, input));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const getConsents = useCallback(async () => {
    setError(null);
    try {
      return await callAuthed((token) => getConsentsApi(token));
    } catch (err) {
      setError(messageFor(err));
      return null;
    }
  }, [callAuthed]);

  const updateConsent = useCallback(
    async (input: { type: "terms" | "privacy" | "marketing"; granted: boolean }) => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => updateConsentApi(token, input));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const exportData = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      return await callAuthed((token) => exportCustomerData(token));
    } catch (err) {
      setError(messageFor(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [callAuthed]);

  const getAddresses = useCallback(async () => {
    setError(null);
    try {
      return await callAuthed((token) => getAddressesApi(token));
    } catch (err) {
      setError(messageFor(err));
      return null;
    }
  }, [callAuthed]);

  const createAddress = useCallback(
    async (input: AddressInput) => {
      setIsBusy(true);
      setError(null);
      try {
        return await callAuthed((token) => createAddressApi(token, input));
      } catch (err) {
        setError(messageFor(err));
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const updateAddress = useCallback(
    async (id: string, patch: Partial<AddressInput>) => {
      setIsBusy(true);
      setError(null);
      try {
        return await callAuthed((token) => updateAddressApi(token, id, patch));
      } catch (err) {
        setError(messageFor(err));
        return null;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const deleteAddress = useCallback(
    async (id: string) => {
      setIsBusy(true);
      setError(null);
      try {
        await callAuthed((token) => deleteAddressApi(token, id));
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [callAuthed]
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      isLoading,
      isBusy,
      error,
      register,
      login,
      requestOtp,
      verifyOtp,
      logout,
      updateProfile,
      requestPasswordReset,
      confirmPasswordReset,
      requestEmailVerification,
      requestPhoneVerification,
      confirmPhoneVerification,
      updateMfaPreference,
      changePassword,
      changeEmail,
      getConsents,
      updateConsent,
      exportData,
      getAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
      clearError,
    }),
    [
      customer,
      isLoading,
      isBusy,
      error,
      register,
      login,
      requestOtp,
      verifyOtp,
      logout,
      updateProfile,
      requestPasswordReset,
      confirmPasswordReset,
      requestEmailVerification,
      requestPhoneVerification,
      confirmPhoneVerification,
      updateMfaPreference,
      changePassword,
      changeEmail,
      getConsents,
      updateConsent,
      exportData,
      getAddresses,
      createAddress,
      updateAddress,
      deleteAddress,
      clearError,
    ]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return ctx;
}
