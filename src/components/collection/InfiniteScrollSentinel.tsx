"use client";

import { useEffect, useRef } from "react";

// Substitui a paginação numerada por completo: nenhum clique, a grid carrega
// o próximo lote sozinha. A sentinela fica logo abaixo da grid — o
// IntersectionObserver dispara onLoadMore só quando ela entra na viewport
// (rootMargin antecipa um pouco, pra carregar antes do usuário bater no
// fundo). `page` nunca refaz fetch (ver CollectionBody.tsx), então avançar é
// sempre instantâneo — o spinner aqui sinaliza "tem mais abaixo", não uma
// espera de rede.
export default function InfiniteScrollSentinel({
  hasMore,
  onLoadMore,
}: {
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div ref={ref} className="flex justify-center py-12">
      <svg
        className="h-4 w-4 animate-spin text-neutral-400"
        viewBox="0 0 24 24"
        fill="none"
        role="status"
        aria-label="Loading more products"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="14 42" />
      </svg>
    </div>
  );
}
