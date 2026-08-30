import Link from "next/link";
import type { ProductCardVM } from "@/types/view/product-card";

// Consumes ProductCardVM (real API data for /collections, adapted mock data
// for /search — see src/app/search/page.tsx) instead of the old mock
// Product type, per PLANO-INTEGRACAO-ACCESSORIES.md §7.
//
// Structurally near-identical to components/home/HomeProductCard.tsx (same
// VM, same plain-<img> approach — see that file for why not next/image).
// Left as a separate component rather than unified, since collapsing them
// would mean editing the home page's rendering, which is out of scope here.
export default function ProductCard({
  product,
  imageBg = "white",
}: {
  product: ProductCardVM;
  imageBg?: "white" | "neutral";
}) {
  const bgClass = imageBg === "neutral" ? "bg-neutral-100" : "bg-white";

  const body = (
    <>
      <div className={`relative aspect-square overflow-hidden ${bgClass}`}>
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
        )}
        {product.secondaryImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.secondaryImageUrl}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-3 space-y-1">
        {product.brandName && (
          <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brandName}</p>
        )}
        <h3 className="text-sm font-medium text-neutral-900 group-hover:underline">{product.name}</h3>
        <p className="text-sm text-neutral-900">${product.priceFrom.toFixed(2)}</p>
      </div>
    </>
  );

  // GET /products (this endpoint) doesn't return a slug — see
  // PLANO-INTEGRACAO-HOMEPAGE.md §5.7. Card renders without a link rather
  // than guessing a URL.
  if (!product.slug) {
    return <div className="group block">{body}</div>;
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {body}
    </Link>
  );
}
