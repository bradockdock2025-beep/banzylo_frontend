import Image from "next/image";
import type { HomeFeaturedData } from "@/types/home-featured";

export default function AboutSection({ about }: { about: HomeFeaturedData["about"] }) {
  if (!about.heading || !about.paragraph) return null;

  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden bg-black text-center text-white">
      {about.image && <Image src={about.image} alt="" fill className="object-cover opacity-85" />}
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative z-10 mx-auto max-w-md px-6">
        <h2 className="text-2xl font-medium">{about.heading}</h2>
        <p className="mt-4 text-sm text-white/80">{about.paragraph}</p>
        {about.buttonLabel && (
          <a
            href={about.buttonHref ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block border border-white bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black hover:bg-white/90"
          >
            {about.buttonLabel}
          </a>
        )}
      </div>
    </section>
  );
}
