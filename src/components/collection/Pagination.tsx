// Paginação virou slice local (lib/catalog-local.ts) — não navega mais via
// <Link>, só chama onPageChange, que atualiza o state em CollectionBody.tsx.
export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2 text-sm">
      <PageButton page={page - 1} disabled={page <= 1} label="Previous" onPageChange={onPageChange} />
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-8 w-8 items-center justify-center border text-xs ${
              p === page
                ? "border-black bg-black text-white"
                : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {p}
          </button>
        )
      )}
      <PageButton page={page + 1} disabled={page >= totalPages} label="Next" onPageChange={onPageChange} />
    </nav>
  );
}

function PageButton({
  page,
  disabled,
  label,
  onPageChange,
}: {
  page: number;
  disabled: boolean;
  label: string;
  onPageChange: (page: number) => void;
}) {
  if (disabled) {
    return <span className="px-3 py-1 text-xs uppercase tracking-wide text-neutral-300">{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onPageChange(page)}
      className="px-3 py-1 text-xs uppercase tracking-wide text-neutral-700 hover:text-black"
    >
      {label}
    </button>
  );
}

// Classic "1 … 4 5 [6] 7 8 … 21" windowed pagination — full list isn't
// practical once totalPages gets into the dozens.
function buildPageList(current: number, total: number): (number | "…")[] {
  const delta = 1;
  const range: (number | "…")[] = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "…") {
      range.push("…");
    }
  }
  return range;
}
