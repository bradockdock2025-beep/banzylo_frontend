import Link from "next/link";
import type { ProductCardVM } from "@/types/view/product-card";
import ProductCard from "./ProductCard";

// Horizontal product carousel used by the product detail page for the
// "More from <brand>", "Related products" and "Recently viewed" strips.
// Reuses ProductCard so cards look and link exactly like the grid ones.
export default function ProductRail({
  title,
  products,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  products: ProductCardVM[];
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div
        className={
          viewAllHref
            ? "flex items-baseline justify-between gap-4"
            : "text-center"
        }
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs uppercase tracking-wide text-neutral-500 underline hover:text-black"
          >
            {viewAllLabel ?? "View all"}
          </Link>
        )}
      </div>

      {/* Scrolls horizontally but the scrollbar itself is hidden
          (Firefox: scrollbar-width; WebKit/Chrome: ::-webkit-scrollbar). */}
      <div className="mt-8 flex gap-4 overflow-x-auto sm:gap-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-40 shrink-0 sm:w-52">
            <ProductCard product={product} imageBg="neutral" />
          </div>
        ))}
      </div>
    </section>
  );
}
