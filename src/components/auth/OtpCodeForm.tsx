"use client";

import { useState } from "react";

// Shared by /register (confirms the email right after signup), /login
// (passwordless "log in with a code" path — both via POST
// /customers/login/otp/verify, GUIA-INTEGRACAO-AUTENTICACAO.md §1.3) and
// /account/security's phone verification (POST /customers/verify/phone/confirm,
// §1.7) — same 6-digit-code UI, different delivery channel, hence the
// `description` prop instead of a hardcoded "we emailed you" line.
const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-12 w-full rounded-none border border-neutral-300 px-3 text-center text-lg tracking-[0.3em] outline-none focus:border-neutral-900";

export default function OtpCodeForm({
  description,
  onVerify,
  onResend,
  isSubmitting,
  error,
}: {
  /** e.g. "We emailed a 6-digit code to x@y.com." or "We sent a code to your phone." */
  description: React.ReactNode;
  onVerify: (code: string) => void;
  onResend: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onVerify(code);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-neutral-500">{description}</p>

      <div>
        <label className={LABEL} htmlFor="otp-code">
          Code
        </label>
        <input
          id="otp-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={FIELD}
          autoFocus
        />
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || code.length !== 6}
        className="w-full bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Verifying…" : "Verify"}
      </button>
      <button
        type="button"
        onClick={onResend}
        disabled={isSubmitting}
        className="w-full text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
      >
        Resend code
      </button>
    </form>
  );
}
