import { notFound } from "next/navigation";
import { getProductDetail, getAlsoViewed } from "@/lib/api/product-detail";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import ProductRail from "@/components/product/ProductRail";
import RecentlyViewed from "@/components/product/RecentlyViewed";

// PRODUCT-DETAIL-INTEGRACAO/PLANO-INTEGRACAO-PRODUCT-DETAIL.md:
// PDP data is 100% API-sourced (no mock). No generateStaticParams — no
// endpoint lists every product slug, so pages render on demand within the
// apiFetch revalidate window.

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductDetail(slug);
  if (!product) {
    notFound();
  }

  const alsoViewed = await getAlsoViewed(product.id);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div className="min-w-0 lg:w-[58%]">
            <ProductGallery images={product.images} title={product.name} />
          </div>
          <div className="min-w-0 lg:w-[42%]">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </div>

      <ProductRail title="You May Also Like" products={alsoViewed} />

      <RecentlyViewed
        current={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          brandName: product.brandName,
          imageUrl: product.images[0] ?? null,
          priceFrom: product.priceFrom,
        }}
      />
    </div>
  );
}
