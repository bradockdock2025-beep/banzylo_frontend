import Link from "next/link";
import type { ProductCardVM } from "@/types/view/product-card";
import HomeProductGrid from "@/components/product/HomeProductGrid";

export default function BrandSection({
  heading,
  viewAllHref,
  products,
}: {
  heading: string;
  viewAllHref: string;
  products: ProductCardVM[];
}) {
  // A brand with no active products (data.length === 0) hides the whole
  // section instead of rendering an empty carousel with just a heading.
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {heading}
      </h2>
      <div className="mt-10">
        <HomeProductGrid products={products} columns={6} />
      </div>
      <div className="mt-8 flex justify-center">
        <Link
          href={viewAllHref}
          className="border border-black px-6 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white"
        >
          View All
        </Link>
      </div>
    </section>
  );
}
