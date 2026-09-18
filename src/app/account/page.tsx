"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import { Spinner } from "@/components/ui/spinner";

const ACCOUNT_NAV = [
  { href: "/account/security", label: "Security" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/privacy", label: "Privacy & Data" },
];

const LABEL = "block text-xs font-semibold uppercase tracking-wide text-neutral-500";
const FIELD =
  "mt-2 h-10 w-full rounded-none border border-neutral-300 px-3 text-sm outline-none focus:border-neutral-900";

export default function AccountPage() {
  const router = useRouter();
  const { customer, isLoading, isBusy, error, updateProfile, logout, clearError } = useCustomerAuth();

  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState(customer?.phoneNumber ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // CustomerAuthProvider's isLoading only covers the initial silent-refresh
  // check on mount — redirecting before that resolves would bounce someone
  // with a perfectly valid session straight back to /login.
  useEffect(() => {
    if (!isLoading && !customer) router.replace("/login");
  }, [isLoading, customer, router]);

  // "Adjusting state when a prop changes" (react.dev) instead of an effect —
  // resyncs the edit fields whenever `customer` itself changes identity
  // (first load resolving, or updateProfile's fresh response), never while
  // the user is actively typing in between.
  const [prevCustomer, setPrevCustomer] = useState(customer);
  if (customer !== prevCustomer) {
    setPrevCustomer(customer);
    setFirstName(customer?.firstName ?? "");
    setLastName(customer?.lastName ?? "");
    setPhoneNumber(customer?.phoneNumber ?? "");
  }

  if (isLoading || !customer) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-5 w-5 text-neutral-400" />
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (await updateProfile({ firstName, lastName, phoneNumber })) {
      setIsEditing(false);
      setSaved(true);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">My Account</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-neutral-500 underline hover:text-black"
        >
          Log out
        </button>
      </div>

      <p className="mt-6 text-sm text-neutral-500">
        {customer.email}{" "}
        {customer.emailVerified ? (
          <span className="text-green-600">· Verified</span>
        ) : (
          <span className="text-amber-600">· Not verified</span>
        )}
      </p>

      {!isEditing ? (
        <div className="mt-8 space-y-4">
          <div>
            <p className={LABEL}>Name</p>
            <p className="mt-1 text-sm text-neutral-900">
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
            </p>
          </div>
          <div>
            <p className={LABEL}>Phone</p>
            <p className="mt-1 text-sm text-neutral-900">{customer.phoneNumber || "—"}</p>
          </div>

          {saved && <p className="text-sm text-green-600">Profile updated.</p>}

          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setSaved(false);
              clearError();
            }}
            className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div>
            <label className={LABEL} htmlFor="account-first-name">
              First name
            </label>
            <input
              id="account-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="account-last-name">
              Last name
            </label>
            <input
              id="account-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="account-phone">
              Phone
            </label>
            <input
              id="account-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={FIELD}
            />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex-1 border border-neutral-300 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-neutral-700 hover:border-neutral-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <nav className="mt-10 border-t border-neutral-200 pt-8">
        <p className={LABEL}>More</p>
        <ul className="mt-3 space-y-2">
          {ACCOUNT_NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm text-neutral-900 underline hover:text-neutral-600">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
