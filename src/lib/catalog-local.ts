// Correcao-da-Collection-Page.md: reducer puro que deriva o conjunto exibido
// a partir do dataset já carregado (`baseProducts`), sem request. Cobre
// exatamente os campos que `ProductListItemApi` de fato carrega — brand e
// preço — que são os únicos filtros resolvíveis localmente (ver §0 do plano:
// color/gender não vêm na listagem, só no endpoint de detalhe por produto).

import type { ProductCardVM } from "@/types/view/product-card";
import type { CatalogFiltersVM } from "@/types/view/catalog-filters";
import { parseFilterSearchParams, type CatalogSort, type RawSearchParams } from "./catalog-query";

export interface LocalFilterState {
  brand: string[];
  /** "key:value" pairs — presença aqui sempre força o caminho remoto (ver needsRemoteData). */
  facets: string[];
  minPrice?: number;
  maxPrice?: number;
  sort: CatalogSort;
  page: number;
  limit: number;
}

export const DEFAULT_PAGE_LIMIT = 12;

export function createDefaultLocalState(): LocalFilterState {
  return { brand: [], facets: [], sort: "featured", page: 1, limit: DEFAULT_PAGE_LIMIT };
}

// Facets (color/gender/etc.) e sort "newest"/"relevance" dependem de dados
// que não existem no ProductCardVM local — a única forma honesta de resolver
// é perguntar ao backend (guide: "apenas quando os dados necessários não
// estiverem disponíveis"). Brand, price e sort por preço ficam sempre locais.
export function needsRemoteData(state: Pick<LocalFilterState, "facets" | "sort">): boolean {
  return state.facets.length > 0 || state.sort === "newest" || state.sort === "relevance";
}

function brandNameToSlugMap(filters: CatalogFiltersVM): Map<string, string> {
  return new Map(filters.brands.map((b) => [b.label, b.value]));
}

// Aplica brand + price + sort(preço) sobre o dataset base, sem paginar.
// Nunca chamado quando needsRemoteData(state) é true — nesse caso o dataset
// já vem pronto (filtrado+ordenado) do backend, ver CollectionBody.tsx.
export function deriveLocalProducts(
  baseProducts: ProductCardVM[],
  baseFilters: CatalogFiltersVM,
  state: Pick<LocalFilterState, "brand" | "minPrice" | "maxPrice" | "sort">
): ProductCardVM[] {
  let result = baseProducts;

  if (state.brand.length > 0) {
    const nameToSlug = brandNameToSlugMap(baseFilters);
    const selected = new Set(state.brand);
    result = result.filter((p) => p.brandName && selected.has(nameToSlug.get(p.brandName) ?? ""));
  }

  if (state.minPrice !== undefined) {
    const min = state.minPrice;
    result = result.filter((p) => p.priceFrom >= min);
  }
  if (state.maxPrice !== undefined) {
    const max = state.maxPrice;
    result = result.filter((p) => p.priceFrom <= max);
  }

  if (state.sort === "price_asc") result = [...result].sort((a, b) => a.priceFrom - b.priceFrom);
  else if (state.sort === "price_desc") result = [...result].sort((a, b) => b.priceFrom - a.priceFrom);
  // "featured" (default): mantém a ordem original do dataset base — é a
  // ordem que o próprio backend já devolve sem sort explícito.

  return result;
}

// Lê o estado inicial de filtro direto da URL (deep link / primeiro load da
// rota). Único momento em que a URL é a fonte — depois disso quem manda é o
// state do CollectionBody, e a URL só reflete (ver encodeLocalFilterState).
// categoryId vazio: parseFilterSearchParams só usa esse campo pra devolvê-lo
// de volta no CatalogQueryParams, que aqui é descartado.
export function parseLocalFilterState(searchParams: RawSearchParams): LocalFilterState {
  const parsed = parseFilterSearchParams(searchParams, "");
  return {
    brand: parsed.brand,
    facets: parsed.facets,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    sort: parsed.sort ?? "featured",
    page: parsed.page,
    limit: DEFAULT_PAGE_LIMIT,
  };
}

// Serializa o state de volta pra query string (usado com history.replaceState
// — nunca com <Link>/router.push, ver CollectionBody.tsx). Facets ficam
// guardados internamente como "key:value" (mesmo formato que o backend
// espera), mas na URL cada facet key vira seu próprio param, agrupando
// valores por vírgula — para ficar legível/compartilhável (?color=black,white),
// e não um único blob "facets=color:black,color:white".
export function encodeLocalFilterState(state: LocalFilterState): string {
  const qs = new URLSearchParams();
  if (state.brand.length > 0) qs.set("brand", state.brand.join(","));

  const byKey = new Map<string, string[]>();
  for (const f of state.facets) {
    const [key, value] = f.split(":");
    if (!key || !value) continue;
    const arr = byKey.get(key) ?? [];
    arr.push(value);
    byKey.set(key, arr);
  }
  for (const [key, values] of byKey) qs.set(key, values.join(","));

  if (state.minPrice !== undefined) qs.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== undefined) qs.set("maxPrice", String(state.maxPrice));
  if (state.sort !== "featured") qs.set("sort", state.sort);
  if (state.page > 1) qs.set("page", String(state.page));
  return qs.toString();
}

export interface PaginatedResult {
  items: ProductCardVM[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Paginação local — slice puro sobre o array já filtrado/ordenado. Ajusta a
// página para o último valor válido se o filtro reduziu o total de páginas
// (Correcao-da-Collection-Page.md §11).
export function paginateProducts(products: ProductCardVM[], page: number, limit: number): PaginatedResult {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: products.slice(start, start + limit),
    meta: { total, page: safePage, limit, totalPages },
  };
}
