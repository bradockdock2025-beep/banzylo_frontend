"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getGuestOrder } from "@/lib/api/orders";
import { Spinner } from "@/components/ui/spinner";
import type { GuestOrderVM } from "@/types/view/order";

// No separate "confirm payment" endpoint exists (GUIA-INTEGRACAO-AUTENTICACAO.md
// §7 passo 5) — this page polls GET /orders/guest/:id until the payment
// settles (Stripe's webhook is what actually flips the status server-side).
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes, matches typical webhook latency with margin

export default function CheckoutConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [order, setOrder] = useState<GuestOrderVM | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!token) return; // rendered directly below, nothing to fetch
    let cancelled = false;

    getGuestOrder(params.orderId, token)
      .then((fresh) => {
        if (cancelled) return;
        setOrder(fresh);
        setError(null);
        if (fresh.paymentStatus === "pending" && pollCount < MAX_POLLS) {
          setTimeout(() => {
            if (!cancelled) setPollCount((c) => c + 1);
          }, POLL_INTERVAL_MS);
        }
      })
      .catch(() => {
        if (!cancelled) setError("We couldn't find this order.");
      });

    return () => {
      cancelled = true;
    };
  }, [params.orderId, token, pollCount]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      {!token && <p className="text-red-600">Missing order token — this link looks incomplete.</p>}
      {token && error && !order && <p className="text-red-600">{error}</p>}
      {token && !order && !error && (
        <p className="flex items-center justify-center gap-2 text-neutral-500">
          <Spinner className="h-4 w-4" /> Loading your order…
        </p>
      )}

      {order && (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {order.paymentStatus === "paid" ? "Order confirmed!" : "Confirming your payment…"}
          </h1>
          <p className="mt-2 text-neutral-500">Order #{order.orderNumber}</p>

          {order.paymentStatus === "pending" && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Spinner className="h-4 w-4" /> Waiting for payment confirmation…
            </p>
          )}
          {order.paymentStatus && !["pending", "paid"].includes(order.paymentStatus) && (
            <p className="mt-4 text-sm text-red-600">
              Payment status: {order.paymentStatus}. If this looks wrong, contact support with your
              order number.
            </p>
          )}

          <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200 text-left">
            {order.items.map((line) => (
              <li key={line.variantId} className="flex justify-between py-3 text-sm">
                <span>
                  {line.productName} × {line.quantity}
                </span>
                <span>${line.totalPrice.toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>

          <Link
            href="/"
            className="mt-10 inline-block border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
          >
            Continue shopping
          </Link>
        </>
      )}
    </div>
  );
}
