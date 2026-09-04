"use client";

import { useState } from "react";
import FilterGroup from "./FilterGroup";
import type { CatalogFiltersVM, CatalogCategoryOption } from "@/types/view/catalog-filters";

// Long option lists (Brand, Color, the size facets, deep subcategory trees)
// get a capped height with vertical scroll but NO visible scrollbar — same
// treatment as the PDP product rails. `max-h` only kicks in when the list is
// actually long; short lists render in full.
const SCROLL_LIST =
  "max-h-64 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

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
  selectedMinPrice,
  selectedMaxPrice,
  onToggleBrand,
  onToggleFacet,
  onPriceChange,
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
  /** undefined = nenhum filtro aplicado ainda → slider cobre o range inteiro (filters.priceMin/Max). */
  selectedMinPrice?: number;
  selectedMaxPrice?: number;
  onToggleBrand: (value: string) => void;
  onToggleFacet: (key: string, value: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onSelectSubcategory: (subcategory: CatalogCategoryOption) => void;
}) {
  const selectedBrandSet = new Set(selectedBrands);
  const selectedFacetSet = new Set(selectedFacets);

  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      {categoryOptions.length > 0 && (
        <FilterGroup label="Category" defaultOpen>
          <ul className={`${SCROLL_LIST} space-y-2 text-sm text-neutral-700`}>
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

      {/* Open by default when a brand is already applied — e.g. arriving from
          a home "View All" (/collections/apparel?brand=<slug>) so the active
          filter is visible, not hidden in a collapsed group. */}
      <FilterGroup label="Brand" defaultOpen={selectedBrands.length > 0}>
        {filters.brands.length > 0 ? (
          <ul className={`${SCROLL_LIST} space-y-2 text-sm text-neutral-700`}>
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
            <div className={`${SCROLL_LIST} flex flex-wrap gap-3`}>
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
            <ul className={`${SCROLL_LIST} space-y-2 text-sm text-neutral-700`}>
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
          <PriceRangeSlider
            min={filters.priceMin}
            max={filters.priceMax}
            valueMin={selectedMinPrice ?? filters.priceMin}
            valueMax={selectedMaxPrice ?? filters.priceMax}
            onChange={onPriceChange}
          />
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

// Dois <input type="range"> nativos sobrepostos na mesma trilha (thumbs
// estilizados em globals.css) — cada ponto arrasta seu próprio limite. Os
// dois campos abaixo espelham o valor do slider mas também aceitam digitação
// direta (limite identificado ao vivo: só dava pra ajustar arrastando) — o
// texto digitado só é aplicado (clamp + onChange) no blur/Enter, pra não
// interromper o usuário no meio da digitação de um número de vários dígitos.
function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
}) {
  const range = Math.max(max - min, 1);
  const minPct = ((valueMin - min) / range) * 100;
  const maxPct = ((valueMax - min) / range) * 100;

  const [minText, setMinText] = useState(String(valueMin));
  const [maxText, setMaxText] = useState(String(valueMax));
  // "Adjusting state when a prop changes" (react.dev) em vez de useEffect:
  // ressincroniza o texto quando o valor muda por fora (arrasto do slider,
  // ou clamp aplicado pelo outro campo) — nunca enquanto o campo em si está
  // sendo digitado, já que digitar não toca valueMin/valueMax até o blur.
  const [prevValueMin, setPrevValueMin] = useState(valueMin);
  const [prevValueMax, setPrevValueMax] = useState(valueMax);
  if (valueMin !== prevValueMin) {
    setPrevValueMin(valueMin);
    setMinText(String(valueMin));
  }
  if (valueMax !== prevValueMax) {
    setPrevValueMax(valueMax);
    setMaxText(String(valueMax));
  }

  function commitMin() {
    const parsed = Number(minText);
    const clamped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, min), valueMax) : valueMin;
    setMinText(String(clamped));
    onChange(clamped, valueMax);
  }

  function commitMax() {
    const parsed = Number(maxText);
    const clamped = Number.isFinite(parsed) ? Math.max(Math.min(parsed, max), valueMin) : valueMax;
    setMaxText(String(clamped));
    onChange(valueMin, clamped);
  }

  return (
    <div>
      <div className="relative h-3.5">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-neutral-200" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-black"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
        />
        <input
          type="range"
          className="price-thumb absolute inset-x-0 top-0 w-full"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
          aria-label="Minimum price slider"
        />
        <input
          type="range"
          className="price-thumb absolute inset-x-0 top-0 w-full"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
          aria-label="Maximum price slider"
        />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-neutral-700">
        <div className="flex flex-1 items-center gap-1 border border-neutral-300 px-3 py-2">
          <span className="text-neutral-400">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={minText}
            onChange={(e) => setMinText(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitMin}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label="Minimum price"
            className="w-full min-w-0 bg-transparent text-center outline-none"
          />
        </div>
        <span className="text-neutral-400">to</span>
        <div className="flex flex-1 items-center gap-1 border border-neutral-300 px-3 py-2">
          <span className="text-neutral-400">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={maxText}
            onChange={(e) => setMaxText(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitMax}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label="Maximum price"
            className="w-full min-w-0 bg-transparent text-center outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// The API gives facet values as slugs (e.g. "black", "multi"), not hex
// codes — most map directly onto valid CSS color keywords. "multi" is the
// one known exception, given a gradient swatch instead of guessing a color.
function swatchBackground(value: string): string {
  if (value === "multi") return "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)";
  return value;
}
