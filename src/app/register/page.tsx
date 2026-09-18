"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import OtpCodeForm from "@/components/auth/OtpCodeForm";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

// Matches the backend's own rule (GUIA-INTEGRACAO-AUTENTICACAO.md §1.1) —
// 8+ chars, at least one upper, one lower, one digit.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register, requestOtp, verifyOtp, isBusy, error, clearError } = useCustomerAuth();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(
        "Password needs 8+ characters, with an uppercase letter, a lowercase letter and a number."
      );
      return;
    }
    setPasswordError(null);
    const result = await register({ email, password, phoneNumber });
    // Registration never auto-logs in (guide §1.1) — the confirmation email
    // (with the same 6-digit code the OTP login flow uses) is already sent
    // by the register call itself, so this step goes straight to entering
    // it rather than requesting a fresh one right away.
    if (result?.requiresEmailVerification) setStep("verify");
  }

  async function handleVerify(code: string) {
    if (await verifyOtp({ email, token: code })) router.push("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Create Account</h1>

      {step === "form" ? (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className={LABEL} htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="register-phone">
              Phone
            </label>
            <input
              id="register-phone"
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                clearError();
              }}
              placeholder="+244912345678"
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
                clearError();
              }}
              className={FIELD}
            />
            <p className="mt-1 text-xs text-neutral-400">
              8+ characters, with an uppercase letter, a lowercase letter and a number.
            </p>
            {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Creating…" : "Create Account"}
          </button>
        </form>
      ) : (
        <div className="mt-8">
          <OtpCodeForm
            description={
              <>
                We emailed a 6-digit code to <strong className="text-neutral-900">{email}</strong>.
              </>
            }
            onVerify={handleVerify}
            onResend={() => requestOtp(email)}
            isSubmitting={isBusy}
            error={error}
          />
        </div>
      )}

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-neutral-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
