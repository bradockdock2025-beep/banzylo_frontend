"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import OtpCodeForm from "@/components/auth/OtpCodeForm";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

type Mode = "password" | "otp-request" | "otp-verify";

export default function LoginPage() {
  const router = useRouter();
  const { login, requestOtp, verifyOtp, isBusy, error, clearError } = useCustomerAuth();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function switchMode(next: Mode) {
    clearError();
    setMode(next);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (await login({ email, password })) router.push("/account");
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (await requestOtp(email)) switchMode("otp-verify");
  }

  async function handleVerifyOtp(code: string) {
    if (await verifyOtp({ email, token: code })) router.push("/account");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Log In</h1>

      {mode === "password" && (
        <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-6">
          <div>
            <label className={LABEL} htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
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
            <label className={LABEL} htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className={FIELD}
            />
            <Link
              href="/forgot-password"
              className="mt-1 inline-block text-xs text-neutral-500 underline hover:text-black"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Logging in…" : "Log In"}
          </button>
          <button
            type="button"
            onClick={() => switchMode("otp-request")}
            className="w-full text-xs text-neutral-500 underline hover:text-black"
          >
            Log in with a code instead
          </button>
        </form>
      )}

      {mode === "otp-request" && (
        <form onSubmit={handleRequestOtp} className="mt-8 space-y-6">
          <div>
            <label className={LABEL} htmlFor="login-otp-email">
              Email
            </label>
            <input
              id="login-otp-email"
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
            {isBusy ? "Sending…" : "Send Code"}
          </button>
          <button
            type="button"
            onClick={() => switchMode("password")}
            className="w-full text-xs text-neutral-500 underline hover:text-black"
          >
            Back to password login
          </button>
        </form>
      )}

      {mode === "otp-verify" && (
        <div className="mt-8">
          <OtpCodeForm
            description={
              <>
                We emailed a 6-digit code to <strong className="text-neutral-900">{email}</strong>.
              </>
            }
            onVerify={handleVerifyOtp}
            onResend={() => requestOtp(email)}
            isSubmitting={isBusy}
            error={error}
          />
        </div>
      )}

      <p className="mt-8 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-neutral-900 underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
