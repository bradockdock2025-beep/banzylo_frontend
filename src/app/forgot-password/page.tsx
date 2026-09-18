"use client";

import { useState } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

export default function ForgotPasswordPage() {
  const { requestPasswordReset, isBusy, error, clearError } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Backend always responds 200 regardless of whether the email exists
    // (GUIA-INTEGRACAO-AUTENTICACAO.md §1.8 — anti-enumeration by design),
    // so the success state below never varies based on the result either.
    if (await requestPasswordReset(email)) setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Check Your Email</h1>
        <p className="mt-4 text-sm text-neutral-500">
          If an account exists for <strong className="text-neutral-900">{email}</strong>, we sent a
          link to reset your password. It expires in 30 minutes.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
        >
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Forgot Password</h1>
      <p className="mt-4 text-sm text-neutral-500">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className={LABEL} htmlFor="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
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

        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="w-full bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        <Link href="/login" className="text-neutral-900 underline">
          Back to Log In
        </Link>
      </p>
    </div>
  );
}
