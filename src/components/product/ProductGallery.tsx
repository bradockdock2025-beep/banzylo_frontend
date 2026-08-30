"use client";

import { useState } from "react";

// Left column of the product detail page: a vertical thumbnail strip plus
// the large active image, matching the reference PDP layout. Mock product
// images are local `/images/...` paths, so a plain <img> is used here for
// the same reason the card components do (see HomeProductCard.tsx).
export default function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : [];
  const activeSrc = gallery[active] ?? gallery[0];

  if (!activeSrc) {
    return <div className="aspect-square w-full bg-neutral-50" />;
  }

  return (
    <div className="flex gap-4">
      {gallery.length > 1 && (
        <div className="flex w-16 shrink-0 flex-col gap-3 sm:w-20">
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative aspect-square overflow-hidden border ${
                i === active
                  ? "border-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeSrc}
          alt={title}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
