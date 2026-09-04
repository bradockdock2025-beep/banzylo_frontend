"use client";

import { useState } from "react";
import type { ProductCardVM } from "@/types/view/product-card";
import type { HomeCategoryKey } from "@/types/view/home-category";
import HomeProductCard from "@/components/product/HomeProductCard";

export interface NewArrivalsTab {
  key: HomeCategoryKey;
  label: string;
  products: ProductCardVM[];
  /** meta.visible from the API — false means "not enough products to show this tab" (see plan §5.5). */
  visible: boolean;
}

export default function NewArrivals({ tabs }: { tabs: NewArrivalsTab[] }) {
  const visibleTabs = tabs.filter((tab) => tab.visible && tab.products.length > 0);
  const [active, setActive] = useState<HomeCategoryKey | null>(null);

  if (visibleTabs.length === 0) return null;

  const activeTab = visibleTabs.find((tab) => tab.key === active) ?? visibleTabs[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        New Arrivals
      </h2>

      {visibleTabs.length > 1 && (
        <div className="mt-4 flex justify-center gap-8 text-sm font-medium">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={
                activeTab.key === tab.key
                  ? "border-b-2 border-black pb-1 text-black"
                  : "pb-1 text-neutral-400 hover:text-black"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal slider — shows ~6 cards, scrolls to the rest. Scrollbar
          hidden (same treatment as the PDP rails / filter lists). */}
      <div className="mt-10 flex gap-4 overflow-x-auto pb-2 sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {activeTab.products.map((product) => (
          <div key={product.id} className="w-40 shrink-0 sm:w-52">
            <HomeProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
