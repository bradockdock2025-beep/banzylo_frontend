import Link from "next/link";

export default function CollectionHeader({
  title,
  categoryBadge,
}: {
  title: string;
  categoryBadge: string | null;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <h1 className="font-serif text-4xl uppercase tracking-wide text-neutral-900">{title}</h1>
      <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
        <Link href="/" className="hover:text-neutral-600">
          Home
        </Link>{" "}
        / {title}
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
