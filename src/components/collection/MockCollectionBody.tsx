"use client";

import { useState } from "react";
import type { GridDensity } from "./CollectionControls";
import CollectionControls from "./CollectionControls";
import MockFilterSidebar from "./MockFilterSidebar";
import ProductGrid from "@/components/product/ProductGrid";
import { toProductCardVM } from "@/lib/products";
import type { Product, ProductCategory } from "@/types/product";

const DENSITY_TO_COLUMNS = {
  2: 3,
  3: 4,
  list: 1,
} as const;

// Brand collection pages only — mock catalog, not integrated with the real
// API this phase (see PLANO-INTEGRACAO-ACCESSORIES.md §8). Mirrors the
// original CollectionBody.tsx behavior exactly; kept separate from the
// API-driven one since they have fundamentally different data sources (a
// pre-fetched local array here vs. server-paginated/filtered results there).
export default function MockCollectionBody({
  products,
  category,
}: {
  products: Product[];
  category: ProductCategory | null;
}) {
  const [density, setDensity] = useState<GridDensity>(3);

  return (
    <div>
      <CollectionControls density={density} onDensityChange={setDensity} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-xs text-neutral-500">{products.length} products</p>
        <div className="flex flex-col gap-10 lg:flex-row">
          <MockFilterSidebar products={products} category={category} />
          <div className="flex-1">
            <ProductGrid
              products={products.map(toProductCardVM)}
              columns={DENSITY_TO_COLUMNS[density]}
              imageBg="neutral"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
