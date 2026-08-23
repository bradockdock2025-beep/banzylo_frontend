"use client";

import { useState } from "react";
import { addToCart } from "@/lib/api/cart";

type Status = "idle" | "loading" | "done" | "error";

// Matches the real site's product-card__quick-add-button: a "+" icon,
// hidden by default, revealed on card hover (opacity + slide-up handled by
// the parent's `group` class — see HomeProductCard.tsx).
export default function QuickAddButton({ variantId }: { variantId: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "loading") return;
    setStatus("loading");
    const ok = await addToCart(variantId);
    setStatus(ok ? "done" : "error");
    setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-label="Add to cart"
      className="absolute bottom-2 right-2 z-10 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-black text-white opacity-0 shadow-md transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 disabled:cursor-wait disabled:opacity-70"
    >
      <span className="sr-only">Add to cart</span>
      {status === "done" ? <CheckIcon /> : <PlusIcon />}
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12l5 5L19 7" />
    </svg>
  );
}
