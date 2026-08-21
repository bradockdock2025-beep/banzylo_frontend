import Image from "next/image";
import Link from "next/link";

const BANNERS = [
  { label: "Sneakers", href: "/collections/sneakers", image: "/home/banner-sneakers.jpg" },
  { label: "Apparel", href: "/collections/apparel", image: "/home/banner-apparel.jpg" },
  { label: "Accessories", href: "/collections/accessories", image: "/home/banner-accessories.jpg" },
];

export default function CategoryBanners() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3">
      {BANNERS.map((banner) => (
        <Link key={banner.label} href={banner.href} className="group relative flex h-80 items-end justify-center overflow-hidden">
          <Image
            src={banner.image}
            alt={banner.label}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
