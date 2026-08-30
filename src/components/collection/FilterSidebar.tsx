import FilterGroup from "./FilterGroup";
import type { CatalogFiltersVM, CatalogCategoryOption } from "@/types/view/catalog-filters";

// Correcao-da-Collection-Page.md: brand/facet/category são todos "filtros"
// no exemplo do próprio guia (§21: "Category: Headwear" + "Color: Blue"
// lado a lado, nenhum dos dois pode derrubar a página) — nenhum deles usa
// <Link href> mais. Todos viram onClick puro que atualiza o state em
// CollectionBody.tsx, que decide se resolve local ou busca em background
// sem nunca desmontar a sidebar/grid.
export default function FilterSidebar({
  filters,
  categoryOptions,
  activeCategoryId,
  selectedBrands,
  selectedFacets,
  onToggleBrand,
  onToggleFacet,
  onSelectSubcategory,
}: {
  filters: CatalogFiltersVM;
  /** Lista fixa do nível-topo (Accessories/Apparel/...) — nunca vem da
   * categoria ativa, senão some ao entrar numa folha sem filhos (Bags). */
  categoryOptions: CatalogCategoryOption[];
  activeCategoryId: string;
  selectedBrands: string[];
  /** "key:value" tokens, mesmo formato interno do state em catalog-local.ts. */
  selectedFacets: string[];
  onToggleBrand: (value: string) => void;
  onToggleFacet: (key: string, value: string) => void;
  onSelectSubcategory: (subcategory: CatalogCategoryOption) => void;
}) {
  const selectedBrandSet = new Set(selectedBrands);
  const selectedFacetSet = new Set(selectedFacets);

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      {categoryOptions.length > 0 && (
        <FilterGroup label="Category" defaultOpen>
          <ul className="space-y-2 text-sm text-neutral-700">
            {categoryOptions.map((sub) => {
              const isActive = sub.id === activeCategoryId;
              return (
                <li key={sub.id}>
                  {sub.count > 0 ? (
                    <FilterCheckboxButton
                      label={sub.name}
                      count={sub.count}
                      checked={isActive}
                      onClick={() => onSelectSubcategory(sub)}
                    />
                  ) : (
                    <span className="flex items-center justify-between gap-2 text-neutral-300">
                      <span>{sub.name}</span>
                      <span>{sub.count}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup label="Brand">
        {filters.brands.length > 0 ? (
          <ul className="space-y-2 text-sm text-neutral-700">
            {filters.brands.map((brand) => (
              <li key={brand.value}>
                <FilterCheckboxButton
                  label={brand.label}
                  count={brand.count}
                  checked={selectedBrandSet.has(brand.value)}
                  onClick={() => onToggleBrand(brand.value)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">No brands</p>
        )}
      </FilterGroup>

      {/* Facets vary per category — confirmed live: Accessories only has
          "color", Sneakers/Apparel also have "gender" plus the size facets
          (size_men/size_women/size_kids on Sneakers — all three blocks show
          at once by design, GUIA-INTEGRACAO-FILTRO-SIZE.md §3; size_apparel
          on Apparel; none on Accessories). Never assume a fixed set; render
          whatever the API sends, choosing the control by inputType. */}
      {filters.facets.map((facet) => (
        <FilterGroup key={facet.key} label={facet.name}>
          {facet.inputType === "swatch" ? (
            <div className="flex flex-wrap gap-3">
              {facet.values.map((v) => {
                const checked = selectedFacetSet.has(`${facet.key}:${v.value}`);
                return (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => onToggleFacet(facet.key, v.value)}
                    title={`${v.label} (${v.count})`}
                    aria-label={v.label}
                    aria-pressed={checked}
                    className={`h-6 w-6 rounded-full border border-neutral-300 ${
                      checked ? "ring-2 ring-black ring-offset-2" : ""
                    }`}
                    style={{ background: swatchBackground(v.value) }}
                  />
                );
              })}
            </div>
          ) : (
            /* Everything else (checkbox, chip — e.g. the size_* facets and
               the "Style"/garment_type facet) uses the same checkbox-row
               control as Brand/Gender, per design. Label comes pre-formatted
               from the API ("EU 39", "XS", "Sweatpants").

               Unlike brands[], facet values are NOT pre-filtered by the API:
               a facet can ship values with count:0 mixed in (e.g. Style
               returns 8 zero-count garment types alongside the one that has
               products — GUIA-INTEGRACAO-FILTRO-STYLE.md §2). Show those
               greyed and non-clickable, exactly like the Category list above
               does for empty subcategories — hiding them would make the block
               flicker as counts recompute while the user filters. A value
               that's already selected stays clickable even at count:0, so a
               filter is never impossible to undo. */
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm text-neutral-700">
              {facet.values.map((v) => {
                const checked = selectedFacetSet.has(`${facet.key}:${v.value}`);
                return (
                  <li key={v.value}>
                    {v.count > 0 || checked ? (
                      <FilterCheckboxButton
                        label={v.label}
                        count={v.count}
                        checked={checked}
                        onClick={() => onToggleFacet(facet.key, v.value)}
                      />
                    ) : (
                      <span className="flex items-center justify-between gap-2 text-neutral-300">
                        <span className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="flex h-4 w-4 shrink-0 border border-neutral-200"
                          />
                          {v.label}
                        </span>
                        <span>{v.count}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </FilterGroup>
      ))}

      <FilterGroup label="Price">
        {filters.priceMax > 0 ? (
          <p className="text-sm text-neutral-700">
            ${filters.priceMin.toFixed(0)} — ${filters.priceMax.toFixed(0)}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">No products</p>
        )}
      </FilterGroup>
    </aside>
  );
}

function FilterCheckboxButton({
  label,
  count,
  checked,
  onClick,
}: {
  label: string;
  count: number;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={checked}
      className="flex w-full items-center justify-between gap-2 text-left hover:text-black"
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] ${
            checked ? "border-black bg-black text-white" : "border-neutral-300"
          }`}
        >
          {checked && "✓"}
        </span>
        {label}
      </span>
      <span className="text-neutral-400">{count}</span>
    </button>
  );
}

// The API gives facet values as slugs (e.g. "black", "multi"), not hex
// codes — most map directly onto valid CSS color keywords. "multi" is the
// one known exception, given a gradient swatch instead of guessing a color.
function swatchBackground(value: string): string {
  if (value === "multi") return "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)";
  return value;
}
