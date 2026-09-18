"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/product/ProductGrid";
import { getOrFetchSearchIndex, seedSearchIndex } from "@/lib/search-index";
import type { ProductCardVM } from "@/types/view/product-card";

// Word-prefix match, not a raw substring search: a plain .includes() over
// the full name/brand string matches a query anywhere inside any word (e.g.
// "ing" would match "Racing", "Shopping bag", ...) which reads as random,
// unrelated results once the query gets short. Splitting into words and
// requiring each query token to PREFIX some word (name or brand) is what
// "type nike, see Nike products" actually means — every result genuinely
// starts with what was typed, on some word boundary.
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function matches(product: ProductCardVM, queryTokens: string[]): boolean {
  const words = tokenize(`${product.name} ${product.brandName ?? ""}`);
  return queryTokens.every((token) => words.some((word) => word.startsWith(token)));
}

// Local-first: the whole catalog arrives once (SSR via search/page.tsx,
// already cached client-side afterward — lib/search-index.ts) and every
// keystroke filters that in-memory array. No request is ever made per
// keystroke.
export default function SearchResultsBody({
  initialQuery,
  initialProducts,
}: {
  initialQuery: string;
  initialProducts: ProductCardVM[];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [allProducts, setAllProducts] = useState(initialProducts);

  useEffect(() => {
    seedSearchIndex(initialProducts);
  }, [initialProducts]);

  // Only relevant if the SSR fetch came back empty (API hiccup at request
  // time) — lib/search-index.ts's cache means this resolves instantly
  // whenever Header's prefetch (or a previous /search visit) already warmed it.
  useEffect(() => {
    if (allProducts.length > 0) return;
    getOrFetchSearchIndex().then(setAllProducts);
  }, [allProducts.length]);

  // URL as a mirror of state, for shareable/deep-linkable search URLs —
  // never a network trigger here, purely cosmetic.
  useEffect(() => {
    const q = query.trim();
    const url = q ? `${window.location.pathname}?q=${encodeURIComponent(q)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query]);

  const trimmed = query.trim();
  const queryTokens = tokenize(trimmed);
  const results = queryTokens.length > 0 ? allProducts.filter((p) => matches(p, queryTokens)) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mx-auto mb-10 max-w-xl">
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products or brands"
          className="w-full border border-neutral-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </div>

      {!trimmed ? (
        <p className="text-neutral-500">Search for a product or brand.</p>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-neutral-500">No products found for &quot;{trimmed}&quot;.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="border border-black px-6 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <p className="mb-6 text-xs text-neutral-500">
            {results.length} results for &quot;{trimmed}&quot;
          </p>
          <ProductGrid products={results} />
        </>
      )}
    </div>
  );
}
