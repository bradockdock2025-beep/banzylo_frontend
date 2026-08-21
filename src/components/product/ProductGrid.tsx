import type { Product } from "@/types/product";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  columns = 4,
  imageBg = "white",
}: {
  products: Product[];
  columns?: 1 | 3 | 4 | 6;
  imageBg?: "white" | "neutral";
}) {
  if (products.length === 0) {
    return <p className="py-16 text-center text-neutral-500">No products found.</p>;
  }

  const lgColsMap: Record<number, string> = {
    1: "lg:grid-cols-1",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    6: "lg:grid-cols-6",
  };
  const smCols = columns === 1 ? "sm:grid-cols-1" : "sm:grid-cols-3";
  const baseCols = columns === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`grid ${baseCols} gap-x-4 gap-y-8 ${smCols} ${lgColsMap[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} imageBg={imageBg} />
      ))}
    </div>
  );
}
