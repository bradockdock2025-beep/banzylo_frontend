"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";

// The cart drawer (CartDrawer.tsx) is the primary surface; this full page is
// the fallback for a direct /cart visit. Same data, same actions.
export default function CartPage() {
  const { cart, isBusy, error, setItemQuantity, removeItem, emptyCart } = useCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-semibold text-neutral-900">Your Cart</h1>
        <p className="mt-4 text-neutral-500">Your cart is empty.</p>
        <Link
          href="/"
          className="mt-8 inline-block border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Your Cart ({cart?.count})</h1>
        <button
          type="button"
          onClick={emptyCart}
          disabled={isBusy}
          className="text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
        >
          Clear cart
        </button>
      </div>

      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
        {items.map((line) => (
          <li key={line.variantId} className={`flex gap-4 py-6 ${line.available ? "" : "opacity-60"}`}>
            <div className="h-28 w-24 shrink-0 overflow-hidden bg-neutral-100">
              {line.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {line.brandName && (
                <p className="text-xs uppercase tracking-wide text-neutral-500">{line.brandName}</p>
              )}
              {line.slug ? (
                <Link href={`/products/${line.slug}`} className="text-sm text-neutral-900 hover:underline">
                  {line.name}
                </Link>
              ) : (
                <p className="text-sm text-neutral-900">{line.name}</p>
              )}
              {line.sku && <p className="mt-0.5 text-xs text-neutral-400">{line.sku}</p>}
              {!line.available && <p className="mt-1 text-xs text-red-600">No longer available</p>}

              <div className="mt-3 flex items-center gap-4">
                <div className="flex items-center border border-neutral-300">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={isBusy}
                    onClick={() => setItemQuantity(line.variantId, line.quantity - 1)}
                    className="px-2 py-1 disabled:opacity-40"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-8 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={isBusy || !line.available || line.quantity >= line.stockAvailable}
                    onClick={() => setItemQuantity(line.variantId, line.quantity + 1)}
                    className="px-2 py-1 disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.variantId)}
                  disabled={isBusy}
                  className="text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="shrink-0 text-right text-sm text-neutral-900">
              ${line.lineTotal.toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-end gap-1">
        <div className="flex w-64 items-center justify-between text-sm">
          <span className="font-semibold uppercase tracking-wide">Subtotal</span>
          <span className="font-medium">${(cart?.subtotal ?? 0).toFixed(2)}</span>
        </div>
        <p className="text-xs text-neutral-500">Taxes and shipping calculated at checkout</p>
        <button
          type="button"
          disabled
          title="Checkout is coming soon"
          className="mt-3 w-64 bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-60"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
