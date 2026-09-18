"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { readCartToken } from "@/lib/cart-token";
import { getGuestQuote, createGuestOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/http";
import GuestContactForm from "./GuestContactForm";
import StripePaymentForm from "./StripePaymentForm";
import type { CreateGuestOrderVM } from "@/types/view/order";

// Guest checkout only (GUIA-INTEGRACAO-COMPRA.md §1) — the logged-in variant
// (§2) is a separate, deferred integration; there's no auth in this app yet.
// Presented as a centered modal over whatever page the shopper was on (not a
// route) — matches the reference UI: "1 — Contact › 2 — Payment" stepper,
// step 1 collects phone+country, step 2 hands off to Stripe Elements, which
// renders its own address/payment-method UI (nothing to build there).

const ERROR_COPY: Record<string, string> = {
  CART_EMPTY: "Your cart is empty.",
  ITEMS_UNAVAILABLE: "Some items in your cart are no longer available — remove them to continue.",
  MIXED_CART_NOT_ALLOWED: "Pre-order and in-stock items can't be checked out together.",
  INSUFFICIENT_STOCK: "Not enough stock for one of the items in your cart.",
  PRESALE_LIMIT_REACHED: "Pre-order limit reached for one of the items in your cart.",
};

function messageFor(err: unknown): string {
  if (err instanceof ApiError) return (err.code && ERROR_COPY[err.code]) || err.message;
  return "Something went wrong. Please try again.";
}

type Step = "contact" | "payment";

export default function CheckoutModal() {
  const router = useRouter();
  const { cart, isCheckoutOpen, closeCheckout, emptyCart } = useCart();
  const [step, setStep] = useState<Step>("contact");
  const [order, setOrder] = useState<CreateGuestOrderVM | null>(null);
  // Kept around after step 1 purely to prefill Stripe's AddressElement phone
  // field on step 2 — otherwise the guest's phone never reaches Stripe at
  // all (AddressElement has no phone field by default).
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resets local step/order state right when the modal closes (whichever way
  // it closes — X, backdrop, Escape, or after a successful payment) so the
  // next open always starts clean, without needing an effect keyed off
  // isCheckoutOpen just to synchronize local state.
  function handleClose() {
    closeCheckout();
    setStep("contact");
    setOrder(null);
    setPhone("");
    setIsSubmitting(false);
    setError(null);
  }

  useEffect(() => {
    if (!isCheckoutOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const items = cart?.items ?? [];
  const hasUnavailable = items.some((line) => !line.available);

  async function handleContactSubmit(input: { phone: string; country: string }) {
    const token = readCartToken();
    if (!token) {
      setError("Your cart session expired — please add your items again.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Quote first, purely to surface CART_EMPTY/ITEMS_UNAVAILABLE/etc.
      // before committing to an order — its numbers aren't shown in this
      // modal (no order-summary sidebar in the reference UI), the created
      // order's own total is authoritative anyway.
      await getGuestQuote(token, input.country);
      const created = await createGuestOrder(token, input);
      setOrder(created);
      setPhone(input.phone);
      // Server already emptied the cart on order creation — sync local
      // state so the header badge/drawer don't keep showing stale items.
      // Non-blocking: the order is already placed either way.
      emptyCart().catch(() => {});
      setStep("payment");
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePaid() {
    if (!order) return;
    const confirmationPath = `/checkout/confirmation/${order.orderId}?token=${order.guestToken}`;
    handleClose();
    router.push(confirmationPath);
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const confirmationPath = order
    ? `/checkout/confirmation/${order.orderId}?token=${order.guestToken}`
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="w-full max-w-lg bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <ol className="flex items-center gap-2 text-sm">
            <li className={step === "contact" ? "font-semibold text-neutral-900" : "text-neutral-400"}>
              1 — Contact
            </li>
            <li className="text-neutral-300">›</li>
            <li className={step === "payment" ? "font-semibold text-neutral-900" : "text-neutral-400"}>
              2 — Payment
            </li>
          </ol>
          <button type="button" onClick={handleClose} aria-label="Close checkout" className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "contact" ? (
          <>
            <h2 className="mt-6 text-xl font-semibold uppercase tracking-wide text-neutral-900">
              Checkout as Guest
            </h2>
            {hasUnavailable && (
              <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Some items in your cart are no longer available — remove them from your cart to
                continue.
              </p>
            )}
            <GuestContactForm
              onSubmit={handleContactSubmit}
              isSubmitting={isSubmitting}
              error={error}
              disabled={hasUnavailable}
            />
          </>
        ) : (
          order && (
            <>
              {/* Going back doesn't cancel the order already created above —
                  it simply lapses on its own after the reservation timeout
                  (GUIA-INTEGRACAO-AUTENTICACAO.md §7) if never paid. */}
              <button
                type="button"
                onClick={() => setStep("contact")}
                className="mt-4 text-xs text-neutral-500 underline hover:text-black"
              >
                ‹ Back
              </button>
              <h2 className="mt-2 text-xl font-semibold uppercase tracking-wide text-neutral-900">
                Payment
              </h2>
              <p className="mt-1 text-xs text-neutral-500">All transactions are secure and encrypted.</p>
              <div className="mt-6">
                <StripePaymentForm
                  clientSecret={order.clientSecret}
                  publishableKey={order.publishableKey}
                  returnUrl={`${origin}${confirmationPath}`}
                  phone={phone}
                  onPaid={handlePaid}
                />
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
