import Link from "next/link";
import type { TileApi } from "@/types/api/tile";
import { resolveCollectionHref } from "@/lib/api/resolve-href";

const FALLBACK_BANNERS = [
  { label: "Sneakers", href: "/collections/sneakers", image: "/home/banner-sneakers.jpg" },
  { label: "Apparel", href: "/collections/apparel", image: "/home/banner-apparel.jpg" },
  { label: "Accessories", href: "/collections/accessories", image: "/home/banner-accessories.jpg" },
];

interface Banner {
  label: string;
  href: string;
  image: string;
}

// tile.href from the API points at its own /products?categoryId= scheme, not
// this app's routes — resolve by tile.title against our known local
// collection slugs instead (see PLANO-INTEGRACAO-HOMEPAGE.md §5.6).
function toBanners(tiles: TileApi[]): Banner[] {
  return tiles
    .slice()
    .sort((a, b) => a.position - b.position)
    .flatMap((tile) => {
      const href = resolveCollectionHref(tile.title);
      return href ? [{ label: tile.title, href, image: tile.imageSrc }] : [];
    });
}

export default function CategoryBanners({ tiles }: { tiles: TileApi[] }) {
  const banners = tiles.length > 0 ? toBanners(tiles) : [];
  const resolved = banners.length > 0 ? banners : FALLBACK_BANNERS;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3">
      {resolved.map((banner) => (
        <Link key={banner.label} href={banner.href} className="group relative flex h-80 items-end justify-center overflow-hidden">
          {/* Plain <img>, not next/image — see Hero.tsx for why. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt={banner.label}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="relative z-10 mb-8 flex flex-col items-center gap-3 text-white">
            <span className="text-2xl font-medium">{banner.label}</span>
            <span className="border border-white px-5 py-2 text-xs font-semibold uppercase tracking-wide">
              View All
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
