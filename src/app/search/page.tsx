import { getAllProducts } from "@/lib/products";
import ProductGrid from "@/components/product/ProductGrid";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();

  const products = query
    ? getAllProducts().filter(
        (p) => p.title.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
      )
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
