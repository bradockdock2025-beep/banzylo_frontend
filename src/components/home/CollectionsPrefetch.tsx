"use client";

import { useEffect } from "react";
import { useCatalogCache } from "@/components/providers/CatalogCacheProvider";
import { NEW_ARRIVALS_CATEGORY_IDS } from "@/lib/api/config";
import { getCategories, flattenCategoryTree } from "@/lib/api/categories";

// Arquitetura-Global-de-Dados.MD §2/§3/§10: a Home renderiza primeiro (este
// componente não bloqueia nada, não tem UI) e só depois de montada dispara o
// prefetch em background.
//
// Por que a árvore inteira navegável, não só os 3 nós-topo: confirmado ao
// vivo (2026-08-26) que Accessories/Apparel/Sneakers — as únicas seções
// realmente navegáveis pelo menu do site — somam só 24 categorias no total
// (13+7+4, contando os nós-topo). É um número pequeno e finito, não "baixar
// tudo indiscriminadamente" (guide §15/§11) — é exatamente o universo que o
// usuário pode clicar a partir da sidebar de Category. Pré-aquecer todas
// significa que, na prática, um clique em qualquer subcategoria (Bags,
// Belts...) já encontra o dado pronto ou em andamento, em vez de pagar do
// zero o cold-compute do backend (~9-12s medido em /catalog/filters).
//
// Concorrência limitada (4 por vez): o catálogo tem só 155 produtos, mas
// /catalog/filters é lento o bastante pra 24 chamadas simultâneas
// competirem por recursos no backend — um lote pequeno equilibra "aquecer
// rápido" com "não sobrecarregar".
const CONCURRENCY = 4;

export default function CollectionsPrefetch() {
  const { getOrFetch } = useCatalogCache();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const topLevelIds: string[] = Object.values(NEW_ARRIVALS_CATEGORY_IDS);
      const tree = await getCategories();
      if (cancelled) return;

      const all = flattenCategoryTree(tree);
      const reachableIds = all
        .filter((node) => topLevelIds.includes(node.id) || (node.parentId && topLevelIds.includes(node.parentId)))
        .map((node) => node.id);

      const queue = [...reachableIds];
      async function worker() {
        while (queue.length > 0 && !cancelled) {
          const id = queue.shift();
          if (!id) return;
          await getOrFetch(id);
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => void run(), { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }

    const timeoutId = window.setTimeout(() => void run(), 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [getOrFetch]);

  return null;
}
