import Link from "next/link";
import type { ProductCardVM } from "@/types/view/product-card";
import QuickAddButton from "./QuickAddButton";

// Sibling of ProductCard.tsx, kept deliberately separate: it consumes the
// API-backed ProductCardVM shape (nullable slug/brand) instead of the mock
// Product type still used by /collections and /search — see
// PLANO-INTEGRACAO-HOMEPAGE.md §5 for why those pages aren't touched here.
export default function HomeProductCard({
  product,
  imageBg = "white",
}: {
  product: ProductCardVM;
  imageBg?: "white" | "neutral";
}) {
  const bgClass = imageBg === "neutral" ? "bg-neutral-100" : "bg-white";

  const body = (
    <>
      {/* Plain <img>, not next/image — see Hero.tsx for why (remote Supabase
          URLs + a confirmed next/image dev cold-start config race). */}
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
        {product.isNew && (
          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            New
          </span>
        )}
        {product.variantId && <QuickAddButton variantId={product.variantId} />}
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

  if (!product.slug) {
    return <div className="group block">{body}</div>;
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {body}
    </Link>
  );
}
