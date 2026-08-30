"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import type { CartLineVM } from "@/types/view/cart";

// Slide-out cart, matching CartCodebase.htm (right drawer, "Cart" header,
// line items with brand / name / price / variant / qty stepper / remove,
// footer "Taxes and shipping calculated at checkout" + Checkout button).
// Guest checkout (POST /orders/guest) is the next phase — the Checkout
// button is inert for now.
export default function CartDrawer() {
  const {
    cart,
    count,
    isOpen,
    isBusy,
    error,
    closeDrawer,
    setItemQuantity,
    removeItem,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeDrawer]);

  const items = cart?.items ?? [];

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Cart{count > 0 ? ` (${count})` : ""}
          </p>
          <button type="button" onClick={closeDrawer} aria-label="Close cart" className="p-1">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="text-neutral-500">Your cart is empty.</p>
              <button
                type="button"
                onClick={closeDrawer}
                className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] hover:bg-neutral-900 hover:text-white"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {items.map((line) => (
                <CartLine
                  key={line.variantId}
                  line={line}
                  disabled={isBusy}
                  onQuantity={(q) => setItemQuantity(line.variantId, q)}
                  onRemove={() => removeItem(line.variantId)}
                  onNavigate={closeDrawer}
                />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-neutral-200 px-5 py-4">
            {error && (
              <p className="mb-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold uppercase tracking-wide text-neutral-900">Subtotal</span>
              <span className="font-medium text-neutral-900">${(cart?.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Taxes and shipping calculated at checkout</p>
            <button
              type="button"
              disabled
              title="Checkout is coming soon"
              className="mt-3 flex w-full items-center justify-center gap-2 bg-neutral-900 px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-60"
            >
              Checkout
              <span>${(cart?.subtotal ?? 0).toFixed(2)}</span>
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

function CartLine({
  line,
  disabled,
  onQuantity,
  onRemove,
  onNavigate,
}: {
  line: CartLineVM;
  disabled: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onNavigate: () => void;
}) {
  return (
    <li className={`flex gap-4 py-4 ${line.available ? "" : "opacity-60"}`}>
      <div className="h-24 w-20 shrink-0 overflow-hidden bg-neutral-100">
        {line.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {line.brandName && (
          <p className="text-[0.6875rem] uppercase tracking-wide text-neutral-500">
            {line.brandName}
          </p>
        )}
        {line.slug ? (
          <Link
            href={`/products/${line.slug}`}
            onClick={onNavigate}
            className="block truncate text-sm text-neutral-900 hover:underline"
          >
            {line.name}
          </Link>
        ) : (
          <p className="truncate text-sm text-neutral-900">{line.name}</p>
        )}
        <p className="mt-0.5 text-sm text-neutral-500">${line.unitPrice.toFixed(2)}</p>
        {line.sku && <p className="mt-0.5 text-xs text-neutral-400">{line.sku}</p>}
        {!line.available && (
          <p className="mt-1 text-xs text-red-600">No longer available</p>
        )}

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center border border-neutral-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={disabled}
              onClick={() => onQuantity(line.quantity - 1)}
              className="px-2 py-1 disabled:opacity-40"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="min-w-8 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={disabled || !line.available || line.quantity >= line.stockAvailable}
              onClick={() => onQuantity(line.quantity + 1)}
              className="px-2 py-1 disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-xs text-neutral-500 underline hover:text-black disabled:opacity-40"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
