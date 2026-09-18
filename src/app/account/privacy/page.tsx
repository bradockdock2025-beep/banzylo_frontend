"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/components/providers/CustomerAuthProvider";
import { Spinner } from "@/components/ui/spinner";
import type { ConsentVM } from "@/types/view/customer";

const CONSENT_LABELS: Record<ConsentVM["type"], string> = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  marketing: "Marketing emails",
};

export default function PrivacyPage() {
  const router = useRouter();
  const { customer, isLoading, isBusy, error, getConsents, updateConsent, exportData } = useCustomerAuth();
  const [consents, setConsents] = useState<ConsentVM[] | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isLoading && !customer) router.replace("/login");
  }, [isLoading, customer, router]);

  useEffect(() => {
    if (customer) getConsents().then(setConsents);
  }, [customer, getConsents]);

  if (isLoading || !customer) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-5 w-5 text-neutral-400" />
      </div>
    );
  }

  async function handleToggle(type: ConsentVM["type"], granted: boolean) {
    if (await updateConsent({ type, granted })) {
      setConsents((prev) => {
        const rest = (prev ?? []).filter((c) => c.type !== type);
        return [...rest, { type, granted, version: null, source: null, grantedAt: new Date().toISOString() }];
      });
    }
  }

  // No backend file to download from — the export endpoint returns the JSON
  // directly, so this just re-serializes it into a Blob the browser can save.
  async function handleExport() {
    setExporting(true);
    const data = await exportData();
    setExporting(false);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "banzylo-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const grantedFor = (type: ConsentVM["type"]) => consents?.find((c) => c.type === type)?.granted ?? false;

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Privacy &amp; Data</h1>

      {error && (
        <p className="mt-6 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="mt-8 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Consents</h2>
        {consents === null ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : (
          (["terms", "privacy", "marketing"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-neutral-900">
              <input
                type="checkbox"
                checked={grantedFor(type)}
                onChange={(e) => handleToggle(type, e.target.checked)}
                disabled={isBusy}
                className="h-4 w-4"
              />
              {CONSENT_LABELS[type]}
            </label>
          ))
        )}
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Your Data</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Download a copy of everything we have on your account — profile, addresses, orders, carts
          and consents.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="mt-4 border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? "Preparing…" : "Download My Data"}
        </button>
      </section>
    </div>
  );
}
