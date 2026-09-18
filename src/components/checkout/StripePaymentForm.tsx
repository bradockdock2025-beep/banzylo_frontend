"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// clientSecret/publishableKey come back per-order from POST /orders/guest —
// no static NEXT_PUBLIC Stripe key needed (GUIA-INTEGRACAO-COMPRA.md §1).
export default function StripePaymentForm({
  clientSecret,
  publishableKey,
  returnUrl,
  phone,
  onPaid,
}: {
  clientSecret: string;
  publishableKey: string;
  /** Absolute URL — required by Stripe for redirect-based payment methods. */
  returnUrl: string;
  /** Already collected on the contact step — prefilled here so the guest isn't asked twice. */
  phone: string;
  /** Called when confirmPayment resolves without a redirect (e.g. card paid instantly). */
  onPaid: () => void;
}) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm returnUrl={returnUrl} phone={phone} onPaid={onPaid} />
    </Elements>
  );
}

function PaymentForm({
  returnUrl,
  phone,
  onPaid,
}: {
  returnUrl: string;
  phone: string;
  onPaid: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setError(null);

    // LinkAuthenticationElement below is what actually captures the email —
    // without it, the guest gets no order confirmation email at all
    // (GUIA-INTEGRACAO-AUTENTICACAO.md §8.3: only sent if Stripe captured a
    // receipt_email). AddressElement captures name + shipping address, which
    // the webhook then writes onto the order (§ guest orders only).
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Card methods that don't require a redirect land here — the guide has
    // no separate "confirm" endpoint, the confirmation page itself polls.
    onPaid();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LinkAuthenticationElement />
      {/* Phone was already collected on the contact step (GuestContactForm) —
          AddressElement doesn't show a phone field by default, so without
          `fields.phone: "always"` + the prefill below, it never reaches
          Stripe at all (confirmed missing from the Dashboard customer). */}
      <AddressElement
        options={{
          mode: "shipping",
          fields: { phone: "always" },
          defaultValues: { phone },
        }}
      />
      <PaymentElement />

      {error && (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || isSubmitting}
        className="w-full border border-neutral-900 bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}
