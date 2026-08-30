// Next.js App Router special file: automatically shown while this route
// segment is re-rendering — covers every case that changes searchParams
// (filter click, sort, pagination, subcategory navigation), not just the
// first page load. No wiring needed in FilterSidebar/CollectionControls
// themselves; this is the Suspense fallback for the whole [handle] segment.
export default function CollectionLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading products">
      <div className="mb-6 h-3 w-24 animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="w-full space-y-4 lg:w-56 lg:shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 animate-pulse bg-neutral-100" />
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square animate-pulse bg-neutral-100" />
              <div className="h-3 w-2/3 animate-pulse bg-neutral-100" />
              <div className="h-3 w-1/3 animate-pulse bg-neutral-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
