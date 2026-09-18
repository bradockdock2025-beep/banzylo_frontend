import SearchResultsBody from "@/components/search/SearchResultsBody";
import { getSearchIndexProducts } from "@/lib/api/search";

// Local-first search (2026-09-18 direction): the header icon just links
// here; the whole catalog (274 products today — one lightweight request) is
// fetched ONCE for this first paint, then cached client-side
// (lib/search-index.ts) — every keystroke afterward filters that in-memory
// list, never a new request.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getSearchIndexProducts();

  return <SearchResultsBody initialQuery={(q ?? "").trim()} initialProducts={products} />;
}
