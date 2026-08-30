"use client";

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from "react";
import { getProducts, getCatalogFilters } from "@/lib/api/catalog";
import type { CatalogQueryParams } from "@/lib/catalog-query";
import type { ProductCardVM } from "@/types/view/product-card";
import type { CatalogFiltersVM } from "@/types/view/catalog-filters";

// Arquitetura-Global-de-Dados.MD: uma única camada de dados compartilhada
// entre Home/Collections/Search, em vez de cada página buscar seu próprio
// dataset independente. Client-only (Context em memória) porque é o único
// lugar onde "o que já foi carregado nesta sessão do visitante" existe — o
// servidor não sabe disso. Sem lib nova: não há React Query/SWR/Zustand no
// projeto (confirmado em package.json), então isto é a primeira e única
// camada de cache client-side, não uma segunda em paralelo a outra.

export interface CategoryCatalogEntry {
  products: ProductCardVM[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  filters: CatalogFiltersVM;
  fetchedAt: number;
}

// Alinhado à janela do Next Data Cache server-side (REVALIDATE.catalogProducts/
// catalogFilters = 60s em lib/api/config.ts) — mesma noção de "fresco" nas
// duas camadas.
const TTL_MS = 60_000;

// Confirmado ao vivo (2026-08-25): maior categoria hoje (Accessories) tem 62
// produtos, catálogo inteiro 155. 200 cobre qualquer categoria atual numa
// única request, sem paginar — ver Correcao-da-Collection-Page.md.
const FULL_CATEGORY_LIMIT = 200;

interface CatalogCacheValue {
  /** Retorna a entrada só se ainda estiver dentro do TTL; senão undefined. */
  get(categoryId: string): CategoryCatalogEntry | undefined;
  /** Grava um resultado já obtido (SSR ou prefetch) na camada compartilhada. */
  seed(categoryId: string, entry: CategoryCatalogEntry): void;
  /** Dispara um fetch em background se ainda não houver dado fresco nem um fetch em andamento. Nunca lança — é best-effort. */
  prefetch(categoryId: string): void;
  /** Usada quando o usuário realmente precisa do dado AGORA (ex.: clicou numa
   * subcategoria): usa cache se fresco, ou ENTRA no mesmo fetch já em voo se
   * a Home já tiver disparado um prefetch pra essa categoria — nunca duplica
   * a busca. Só dispara um fetch novo se nada disso existir. Nunca lança —
   * retorna null em caso de falha, pra quem chamou decidir o fallback. */
  getOrFetch(categoryId: string): Promise<CategoryCatalogEntry | null>;
}

const CatalogCacheContext = createContext<CatalogCacheValue | null>(null);

export function CatalogCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef(new Map<string, CategoryCatalogEntry>());
  const inFlightRef = useRef(new Map<string, Promise<void>>());

  const isFresh = useCallback((categoryId: string) => {
    const entry = cacheRef.current.get(categoryId);
    return !!entry && Date.now() - entry.fetchedAt < TTL_MS;
  }, []);

  const get = useCallback(
    (categoryId: string) => (isFresh(categoryId) ? cacheRef.current.get(categoryId) : undefined),
    [isFresh]
  );

  const seed = useCallback((categoryId: string, entry: CategoryCatalogEntry) => {
    // Não sobrescreve um dado mais recente já presente (ex.: um prefetch que
    // termina depois de um SSR mais antigo já ter chegado).
    const existing = cacheRef.current.get(categoryId);
    if (existing && existing.fetchedAt >= entry.fetchedAt) return;
    cacheRef.current.set(categoryId, entry);
  }, []);

  // Único ponto que de fato busca no backend — prefetch() e getOrFetch()
  // reutilizam esta mesma promise em voo, nunca duplicam a busca pro mesmo
  // categoryId.
  const fetchEntry = useCallback(
    (categoryId: string): Promise<void> => {
      const params: CatalogQueryParams = { categoryId, brand: [], facets: [], page: 1, limit: FULL_CATEGORY_LIMIT };
      const promise = Promise.all([getProducts(params), getCatalogFilters(params)])
        .then(([{ items, meta }, filters]) => {
          // getCatalogFilters nunca lança (lib/api/catalog.ts captura e
          // devolve EMPTY_FILTERS_VM em falha de rede) — mas cachear esse
          // vazio como se fosse válido "envenenaria" o cache por até TTL_MS
          // pra uma categoria que na verdade tem produtos. categoryId vazio
          // só acontece nesse caminho de falha (uma resposta real sempre tem
          // o UUID da categoria) — usamos isso como sinal pra NÃO seedar e
          // deixar o próximo acesso tentar de novo.
          if (!filters.categoryId) {
            throw new Error(`getCatalogFilters failed for categoryId=${categoryId}`);
          }
          seed(categoryId, { products: items, meta, filters, fetchedAt: Date.now() });
        })
        .finally(() => {
          inFlightRef.current.delete(categoryId);
        });
      inFlightRef.current.set(categoryId, promise);
      return promise;
    },
    [seed]
  );

  const prefetch = useCallback(
    (categoryId: string) => {
      if (isFresh(categoryId) || inFlightRef.current.has(categoryId)) return;
      // Prefetch em background nunca deve afetar a navegação real do
      // usuário — se falhar, quem precisar do dado busca por conta própria.
      fetchEntry(categoryId).catch(() => {});
    },
    [isFresh, fetchEntry]
  );

  const getOrFetch = useCallback(
    async (categoryId: string): Promise<CategoryCatalogEntry | null> => {
      const cached = get(categoryId);
      if (cached) return cached;
      try {
        const inFlight = inFlightRef.current.get(categoryId);
        await (inFlight ?? fetchEntry(categoryId));
        return cacheRef.current.get(categoryId) ?? null;
      } catch {
        return null;
      }
    },
    [get, fetchEntry]
  );

  const value = useMemo(
    () => ({ get, seed, prefetch, getOrFetch }),
    [get, seed, prefetch, getOrFetch]
  );

  return <CatalogCacheContext.Provider value={value}>{children}</CatalogCacheContext.Provider>;
}

export function useCatalogCache(): CatalogCacheValue {
  const ctx = useContext(CatalogCacheContext);
  if (!ctx) throw new Error("useCatalogCache must be used within CatalogCacheProvider");
  return ctx;
}
