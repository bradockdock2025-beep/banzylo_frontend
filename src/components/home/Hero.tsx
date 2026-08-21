import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-black">
      <Image src="/home/hero-store.jpg" alt="Inside the HYP Miami store" fill priority className="object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(54,54,54,0.2), rgba(4,4,4,0.65) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 text-white sm:px-6">
        <p className="text-sm font-semibold tracking-wide">HŸP MIAMI</p>
        <h1 className="mt-2 max-w-xl text-4xl font-medium sm:text-6xl">The Curated Standard</h1>
        <Link
          href="/collections/sneakers"
          className="mt-6 inline-block border border-white bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black hover:bg-white/90"
        >
          Find Your Style
        </Link>
      </div>
    </section>
  );
}
