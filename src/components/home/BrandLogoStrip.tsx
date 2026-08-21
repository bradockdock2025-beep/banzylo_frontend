import Image from "next/image";

// Logos scraped from the real hypmiami.com homepage scrolling-content section, in source order.
const LOGOS = [
  "/brand-logos/partner-4.png",
  "/brand-logos/partner-3.png",
  "/brand-logos/enfants-riches-deprimes.jpg",
  "/brand-logos/partner-2.jpg",
  "/brand-logos/satoshi-nakamoto.png",
  "/brand-logos/goyard.png",
  "/brand-logos/bottega-desires.png",
  "/brand-logos/partner-1.png",
  "/brand-logos/hmdd.png",
];

export default function BrandLogoStrip() {
  const items = [...LOGOS, ...LOGOS];

  return (
    <section className="overflow-hidden border-y border-black/10 bg-white py-8">
      <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
        {items.map((src, i) => (
          <div key={`${src}-${i}`} className="relative h-10 w-28 shrink-0 grayscale">
            <Image src={src} alt="" fill className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
