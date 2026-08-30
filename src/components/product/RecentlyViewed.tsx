"use client";

import { useEffect, useState } from "react";
import type { ProductCardVM } from "@/types/view/product-card";
import ProductRail from "./ProductRail";

const STORAGE_KEY = "hyp:recently-viewed";
const MAX = 12;

// Tracks products the visitor has opened, in this browser only. On mount it
// reads the list, renders everyone except the product currently on screen,
// then records the current one for next time. localStorage access is guarded
// (private windows / disabled storage throw) and nothing renders until after
// mount, so server and client output match.
export default function RecentlyViewed({ current }: { current: ProductCardVM }) {
  const [items, setItems] = useState<ProductCardVM[]>([]);

  useEffect(() => {
    let stored: ProductCardVM[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as ProductCardVM[];
    } catch {
      stored = [];
    }

    // Reading the list out of localStorage is exactly the "sync from an
    // external system after mount" case; deferring it keeps SSR output empty
    // so hydration matches (same pattern as CollectionBody.tsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(stored.filter((p) => p.id !== current.id));

    try {
      const next = [current, ...stored.filter((p) => p.id !== current.id)].slice(0, MAX);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — tracking is best-effort
    }
  }, [current]);

  if (items.length === 0) return null;

  return <ProductRail title="Recently Viewed" products={items} />;
}
