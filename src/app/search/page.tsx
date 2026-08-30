import { getAllProducts, toProductCardVM } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";

// Search still runs entirely on the mock catalog (not integrated this phase
// — see PLANO-INTEGRACAO-ACCESSORIES.md §11.2). ProductGrid/ProductCard were
// migrated to ProductCardVM for the collection page rebuild; toProductCardVM
// (shared with the brand-collection path, see lib/products.ts) is the one
// conversion point that keeps this page compiling without changing its
// behavior or bringing it into scope.

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();

  const products = query
    ? getAllProducts()
        .filter((p) => p.title.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query))
        .map(toProductCardVM)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <form className="mb-10 max-w-xl">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products or brands"
          className="w-full border border-neutral-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
        />
      </form>

      {query ? (
        <ProductGrid products={products} />
      ) : (
        <p className="text-neutral-500">Search for a product or brand.</p>
      )}
    </div>
  );
}
