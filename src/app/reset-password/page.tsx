"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

// Same rule as register (GUIA-INTEGRACAO-AUTENTICACAO.md §1.8 — matches §1.1).
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { confirmPasswordReset, isBusy, error, clearError } = useCustomerAuth();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError(
        "Password needs 8+ characters, with an uppercase letter, a lowercase letter and a number."
      );
      return;
    }
    setPasswordError(null);
    if (await confirmPasswordReset({ token, newPassword: password })) setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Password Updated</h1>
        <p className="mt-4 text-sm text-neutral-500">
          Your password was changed. All your other sessions were signed out.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Reset Password</h1>
        <p className="mt-4 text-sm text-red-600">
          This link looks incomplete. Request a new one from the login page.
        </p>
        <Link href="/forgot-password" className="mt-8 inline-block text-sm text-neutral-900 underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Reset Password</h1>
      <p className="mt-4 text-sm text-neutral-500">Choose a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className={LABEL} htmlFor="reset-password">
            New Password
          </label>
          <input
            id="reset-password"
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
          {isBusy ? "Saving…" : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
