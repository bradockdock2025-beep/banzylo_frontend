import Link from "next/link";
import type { HeroApi } from "@/types/api/hero";
import { resolveHeroCtaHref } from "@/lib/api/resolve-href";

// A 200 response body of `null` from GET /homepage/hero is valid (hero
// disabled) — fall back to the original local asset/copy rather than break.
export default function Hero({ hero }: { hero: HeroApi | null }) {
  const image = hero?.desktopImage ?? "/home/hero-store.jpg";
  const eyebrow = hero?.eyebrow ?? "HŸP MIAMI";
  const title = hero?.title ?? "The Curated Standard";
  const ctaLabel = hero?.ctaLabel ?? "Find Your Style";
  const ctaHref = resolveHeroCtaHref(hero?.ctaHref, "/collections/sneakers");

  return (
    <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-black">
      {/* Plain <img>, not next/image: this src can be a remote Supabase URL
          from the API, and next/image's dev-mode config resolution has a
          confirmed cold-start race that can wrongly reject a valid remote
          host on the very first render after a server restart. A plain
          <img> never goes through that validation, so it can't fail. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt="Inside the HYP Miami store"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(54,54,54,0.2), rgba(4,4,4,0.65) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 text-white sm:px-6">
        <p className="text-sm font-semibold tracking-wide">{eyebrow}</p>
        <h1 className="mt-2 max-w-xl text-4xl font-medium sm:text-6xl">{title}</h1>
        {ctaLabel && (
          <Link
            href={ctaHref}
            className="mt-6 inline-block border border-white bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black hover:bg-white/90"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
