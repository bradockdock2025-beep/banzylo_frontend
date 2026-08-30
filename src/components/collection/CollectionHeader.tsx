import Link from "next/link";

export interface BreadcrumbNode {
  name: string;
  href: string;
}

export default function CollectionHeader({
  title,
  categoryBadge = null,
  breadcrumb = [],
}: {
  title: string;
  /** Used by brand collection pages (still mock-driven, see PLANO-INTEGRACAO-ACCESSORIES.md §8) — a single badge like "SNEAKERS" instead of a real breadcrumb trail. */
  categoryBadge?: string | null;
  /** Root-to-current chain for real category pages, e.g. [{name:"Accessories",href:"/collections/accessories"}, {name:"Bags",href:"/collections/bags"}]. Omit to fall back to a plain "Home / {title}" trail. */
  breadcrumb?: BreadcrumbNode[];
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <h1 className="font-serif text-4xl uppercase tracking-wide text-neutral-900">{title}</h1>
      <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
        <Link href="/" className="hover:text-neutral-600">
          Home
        </Link>
        {breadcrumb.length > 0
          ? breadcrumb.map((node) => (
              <span key={node.href}>
                {" / "}
                <Link href={node.href} className="hover:text-neutral-600">
                  {node.name}
                </Link>
              </span>
            ))
          : ` / ${title}`}
      </p>

      {categoryBadge && (
        <div className="mt-6">
          <span className="inline-block border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-900">
            {categoryBadge}
          </span>
        </div>
      )}
    </div>
  );
}
