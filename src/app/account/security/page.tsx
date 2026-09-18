"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import OtpCodeForm from "@/components/auth/OtpCodeForm";
import { Spinner } from "@/components/ui/spinner";

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";
const SECTION = "border-b border-neutral-200 py-8 first:pt-0 last:border-0";

export default function SecurityPage() {
  const router = useRouter();
  const {
    customer,
    isLoading,
    isBusy,
    error,
    clearError,
    requestEmailVerification,
    requestPhoneVerification,
    confirmPhoneVerification,
    changePassword,
    changeEmail,
    updateMfaPreference,
  } = useCustomerAuth();

  useEffect(() => {
    if (!isLoading && !customer) router.replace("/login");
  }, [isLoading, customer, router]);

  const [emailSent, setEmailSent] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"idle" | "code">("idle");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  if (isLoading || !customer) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-5 w-5 text-neutral-400" />
      </div>
    );
  }

  async function handleResendEmail() {
    if (await requestEmailVerification()) setEmailSent(true);
  }

  async function handleSendPhoneCode() {
    if (await requestPhoneVerification("sms")) setPhoneStep("code");
  }

  async function handleConfirmPhoneCode(code: string) {
    if (await confirmPhoneVerification(code)) setPhoneStep("idle");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaved(false);
    if (await changePassword({ currentPassword, newPassword })) {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordSaved(true);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailChangeSent(false);
    if (await changeEmail({ email: newEmail })) setEmailChangeSent(true);
  }

  // No method picker in this pass — email is the one channel every account
  // already has verified-or-verifiable, so it's the sane default. The guide
  // (§6.4) is explicit there's no real enforcement at login yet regardless.
  async function handleToggleMfa(enabled: boolean) {
    await updateMfaPreference({ enabled, method: enabled ? "email" : undefined });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Security</h1>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className={SECTION}>
        <h2 className={LABEL}>Email</h2>
        <p className="mt-2 text-sm text-neutral-900">
          {customer.email}{" "}
          {customer.emailVerified ? (
            <span className="text-green-600">· Verified</span>
          ) : (
            <span className="text-amber-600">· Not verified</span>
          )}
        </p>
        {!customer.emailVerified && (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isBusy}
            className="mt-2 text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
          >
            Resend verification email
          </button>
        )}
        {emailSent && <p className="mt-2 text-sm text-green-600">Verification email sent.</p>}
      </section>

      <section className={SECTION}>
        <h2 className={LABEL}>Phone</h2>
        <p className="mt-2 text-sm text-neutral-900">
          {customer.phoneNumber || "—"}{" "}
          {customer.phoneNumber &&
            (customer.phoneVerified ? (
              <span className="text-green-600">· Verified</span>
            ) : (
              <span className="text-amber-600">· Not verified</span>
            ))}
        </p>
        {customer.phoneNumber && !customer.phoneVerified && phoneStep === "idle" && (
          <button
            type="button"
            onClick={handleSendPhoneCode}
            disabled={isBusy}
            className="mt-2 text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
          >
            Send verification code
          </button>
        )}
        {phoneStep === "code" && (
          <div className="mt-4">
            <OtpCodeForm
              description="We sent a code to your phone."
              onVerify={handleConfirmPhoneCode}
              onResend={() => requestPhoneVerification("sms")}
              isSubmitting={isBusy}
              error={error}
            />
          </div>
        )}
      </section>

      <section className={SECTION}>
        <h2 className={LABEL}>Change Password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <input
            type="password"
            placeholder="Current password"
            required
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordSaved(false);
              clearError();
            }}
            className={FIELD}
          />
          <input
            type="password"
            placeholder="New password (6+ characters)"
            required
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordSaved(false);
              clearError();
            }}
            className={FIELD}
          />
          {passwordSaved && <p className="text-sm text-green-600">Password updated.</p>}
          <button
            type="submit"
            disabled={isBusy}
            className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving…" : "Update Password"}
          </button>
        </form>
      </section>

      <section className={SECTION}>
        <h2 className={LABEL}>Change Email</h2>
        {!customer.emailVerified && (
          <p className="mt-2 text-xs text-amber-600">Verify your current email first.</p>
        )}
        <form onSubmit={handleChangeEmail} className="mt-4 space-y-4">
          <input
            type="email"
            placeholder="New email"
            required
            disabled={!customer.emailVerified}
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setEmailChangeSent(false);
              clearError();
            }}
            className={FIELD}
          />
          {emailChangeSent && (
            <p className="text-sm text-green-600">Check your new email to confirm the change.</p>
          )}
          <button
            type="submit"
            disabled={isBusy || !customer.emailVerified}
            className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Saving…" : "Update Email"}
          </button>
        </form>
      </section>

      <section className={SECTION}>
        <h2 className={LABEL}>Two-Factor Authentication</h2>
        <p className="mt-2 text-xs text-neutral-400">
          This only saves your preference — it isn&apos;t enforced at login yet.
        </p>
        <label className="mt-4 flex items-center gap-2 text-sm text-neutral-900">
          <input
            type="checkbox"
            checked={customer.mfaEnabled}
            onChange={(e) => handleToggleMfa(e.target.checked)}
            disabled={isBusy}
            className="h-4 w-4"
          />
          Enable two-factor authentication
        </label>
      </section>
    </div>
  );
}
