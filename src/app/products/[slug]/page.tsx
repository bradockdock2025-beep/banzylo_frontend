import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/products";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {product.images.map((src, i) => (
            <div key={src} className="relative aspect-square overflow-hidden bg-neutral-100">
              <Image
                src={src}
                alt={`${product.title} ${i + 1}`}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-semibold text-neutral-900">{product.title}</h1>
          <p className="mt-4 text-2xl text-neutral-900">${product.price.toFixed(2)}</p>

          <button className="mt-8 w-full border border-black bg-black px-6 py-4 text-sm font-medium uppercase tracking-wide text-white hover:bg-neutral-800">
            Add to Cart
          </button>

          <div className="mt-10 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
            <p>Category: {product.category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
