import FilterGroup from "./FilterGroup";
import { SNEAKER_SIZES } from "@/data/sizes";
import { STYLE_FILTERS } from "@/data/style-filters";
import type { Product, ProductCategory } from "@/types/product";

// Original mock-catalog-driven sidebar, kept alive specifically for BRAND
// collection pages (/collections/chrome-hearts etc.), which are explicitly
// NOT integrated with the real API this phase — see
// PLANO-INTEGRACAO-ACCESSORIES.md §8. Category pages use the real,
// API-driven FilterSidebar.tsx instead. Not merged into one component:
// they're structurally different (this one derives filters client-side from
// an already-fetched product list; the real one gets pre-computed facets
// from GET /catalog/filters).
export default function MockFilterSidebar({
  products,
  category,
}: {
  products: Product[];
  category: ProductCategory | null;
}) {
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const prices = products.map((p) => p.price).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const hasSneakers = products.some((p) => p.category === "sneakers");
  const styleOptions = category ? STYLE_FILTERS[category] : [];

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <FilterGroup label="Brand">
        <ul className="space-y-2 text-sm text-neutral-700">
          {brands.length === 0 && <li className="text-neutral-400">No brands</li>}
          {brands.map((brand) => (
            <li key={brand}>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-black" />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup label="Style">
        {styleOptions.length > 0 ? (
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-neutral-700">
            {styleOptions.map((option) => (
              <li key={option.label}>
                <label className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" className="accent-black" />
                    {option.label}
                  </span>
                  <span className="text-neutral-400">{option.count}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">No style filters available</p>
        )}
      </FilterGroup>

      {hasSneakers && (
        <FilterGroup label="Size">
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-neutral-700">
            {SNEAKER_SIZES.map((size) => (
              <li key={size}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-black" />
                  {size}
                </label>
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup label="Price">
        {prices.length > 0 ? (
          <p className="text-sm text-neutral-700">
            ${minPrice.toFixed(0)} — ${maxPrice.toFixed(0)}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">No products</p>
        )}
      </FilterGroup>
    </aside>
  );
}
