import { notFound } from "next/navigation";
import { getAllCollectionHandles, getCollection } from "@/lib/collections";
import CollectionHeader from "@/components/collection/CollectionHeader";
import CollectionBody from "@/components/collection/CollectionBody";

export function generateStaticParams() {
  return getAllCollectionHandles().map((handle) => ({ handle }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = getCollection(handle);

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <CollectionHeader title={collection.title} categoryBadge={collection.categoryBadge} />
      <CollectionBody products={collection.products} category={collection.category} />
    </div>
  );
}
