"use client";

import { useState } from "react";
import CollectionControls, { type GridDensity } from "./CollectionControls";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product, ProductCategory } from "@/types/product";

const DENSITY_TO_COLUMNS = {
  2: 3,
  3: 4,
  list: 1,
} as const;

export default function CollectionBody({
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
          <FilterSidebar products={products} category={category} />
          <div className="flex-1">
            <ProductGrid products={products} columns={DENSITY_TO_COLUMNS[density]} imageBg="neutral" />
          </div>
        </div>
      </div>
    </div>
  );
}
