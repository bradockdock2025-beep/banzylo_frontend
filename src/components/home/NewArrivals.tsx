"use client";

import { useState } from "react";
import type { Product, ProductCategory } from "@/types/product";
import ProductGrid from "@/components/product/ProductGrid";

const TABS: { key: ProductCategory; label: string }[] = [
  { key: "apparel", label: "Apparel" },
  { key: "sneakers", label: "Sneakers" },
  { key: "accessories", label: "Accessories" },
];

export default function NewArrivals({
  productsByCategory,
}: {
  productsByCategory: Record<ProductCategory, Product[]>;
}) {
  const [active, setActive] = useState<ProductCategory>("apparel");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        New Arrivals
      </h2>

      <div className="mt-4 flex justify-center gap-8 text-sm font-medium">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={
              active === tab.key
                ? "border-b-2 border-black pb-1 text-black"
                : "pb-1 text-neutral-400 hover:text-black"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        <ProductGrid products={productsByCategory[active]} columns={6} />
      </div>
    </section>
  );
}
