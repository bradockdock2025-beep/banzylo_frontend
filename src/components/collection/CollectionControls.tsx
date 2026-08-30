"use client";

import { useState } from "react";
import type { CatalogSort } from "@/lib/catalog-query";

export type GridDensity = 2 | 3 | "list";

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "relevance", label: "Relevance" },
];

// Sort deixou de navegar (router.push) — agora só atualiza o state em
// CollectionBody.tsx, que decide se resolve local (price_asc/desc/featured)
// ou dispara fetch em background (newest/relevance), ver lib/catalog-local.ts.
// sort/onSortChange são opcionais: MockCollectionBody.tsx (páginas de marca,
// catálogo mock, fora de escopo desta correção) não tem estado de sort pra
// controlar — nesse caso o dropdown fica não-controlado localmente, igual ao
// comportamento anterior (nunca aplicava sort real ao grid mock).
export default function CollectionControls({
  density,
  onDensityChange,
  sort,
  onSortChange,
}: {
  density: GridDensity;
  onDensityChange: (density: GridDensity) => void;
  sort?: CatalogSort;
  onSortChange?: (sort: CatalogSort) => void;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [uncontrolledSort, setUncontrolledSort] = useState<CatalogSort>("featured");

  const activeSortValue = sort ?? uncontrolledSort;
  const activeSort = SORT_OPTIONS.find((o) => o.value === activeSortValue) ?? SORT_OPTIONS[0];

  function selectSort(value: CatalogSort) {
    setSortOpen(false);
    if (onSortChange) onSortChange(value);
    else setUncontrolledSort(value);
  }

  return (
    <div className="mx-auto max-w-7xl border-b border-neutral-200 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-neutral-400">
          <button
            aria-label="Large grid"
            onClick={() => onDensityChange(2)}
            className={density === 2 ? "text-black" : "hover:text-neutral-600"}
          >
            <GridIcon cols={2} />
          </button>
          <button
            aria-label="Small grid"
            onClick={() => onDensityChange(3)}
            className={density === 3 ? "text-black" : "hover:text-neutral-600"}
          >
            <GridIcon cols={3} />
          </button>
          <button
            aria-label="List view"
            onClick={() => onDensityChange("list")}
            className={density === "list" ? "text-black" : "hover:text-neutral-600"}
          >
            <ListIcon />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setSortOpen((v) => !v)}
            aria-expanded={sortOpen}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-900"
          >
            Sort By: {activeSort.label} <span aria-hidden>⌄</span>
          </button>
          {sortOpen && (
            <ul className="absolute right-0 z-10 mt-2 w-56 border border-neutral-200 bg-white py-1 text-xs shadow-md">
              {SORT_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    onClick={() => selectSort(option.value)}
                    className={`block w-full px-4 py-2 text-left uppercase tracking-wide hover:bg-neutral-50 ${
                      option.value === activeSort.value ? "font-semibold text-black" : "text-neutral-600"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function GridIcon({ cols }: { cols: 2 | 3 }) {
  const size = cols === 2 ? 8 : 5;
  const gap = 1.5;
  const boxes = Array.from({ length: cols * cols });
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {boxes.map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        return (
          <rect
            key={i}
            x={col * (size + gap)}
            y={row * (size + gap)}
            width={size}
            height={size}
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
