import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";

export default function ProductCard({
  product,
  imageBg = "white",
}: {
  product: Product;
  imageBg?: "white" | "neutral";
}) {
  const [primary, secondary] = product.images;
  const bgClass = imageBg === "neutral" ? "bg-neutral-100" : "bg-white";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className={`relative aspect-square overflow-hidden ${bgClass}`}>
        <Image
          src={primary}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        {secondary && (
          <Image
            src={secondary}
            alt={product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
        <h3 className="text-sm font-medium text-neutral-900 group-hover:underline">{product.title}</h3>
        <p className="text-sm text-neutral-900">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
