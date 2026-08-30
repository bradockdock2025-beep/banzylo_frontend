"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CollectionHeader, { type BreadcrumbNode } from "./CollectionHeader";
import CollectionControls, { type GridDensity } from "./CollectionControls";
import FilterSidebar from "./FilterSidebar";
import Pagination from "./Pagination";
import ProductGrid from "@/components/product/ProductGrid";
import { useCatalogCache } from "@/components/providers/CatalogCacheProvider";
import { getProducts, getCatalogFilters } from "@/lib/api/catalog";
import {
  needsRemoteData,
  deriveLocalProducts,
  paginateProducts,
  parseLocalFilterState,
  encodeLocalFilterState,
  createDefaultLocalState,
  type LocalFilterState,
} from "@/lib/catalog-local";
import type { CatalogSort } from "@/lib/catalog-query";
import type { ProductCardVM } from "@/types/view/product-card";
import type { CatalogFiltersVM, CatalogCategoryOption } from "@/types/view/catalog-filters";

// categoryOptions nunca muda depois do load: é sempre a lista do nível-topo
// (Accessories/Apparel/...), não da subcategoria ativa — ver page.tsx. Assim
// "Category" na sidebar nunca desaparece quando o usuário entra numa folha
// sem filhos (ex.: Bags), só marca qual está selecionada, igual Brand.

const DENSITY_TO_COLUMNS = {
  2: 3,
  3: 4,
  list: 1,
} as const;

// Mesmo teto usado no fetch base do Server Component (page.tsx) e no
// prefetch da Home — um único request devolve a categoria inteira já
// filtrada quando o backend precisa entrar em ação (facet/newest/relevance
// ou troca de subcategoria).
const FULL_CATEGORY_LIMIT = 200;

interface RemoteData {
  products: ProductCardVM[];
  filters: CatalogFiltersVM;
}

// A categoria ativa (produtos, filtros base, título, breadcrumb) é estado do
// componente, não prop fixa — Correcao-da-Collection-Page.md §21 trata
// "Category" exatamente como qualquer outro filtro (junto de Color, Brand),
// que nunca pode desmontar a página. Trocar de subcategoria (ex.: Bags →
// Wallets) busca o novo dataset em background e troca tudo em bloco, sem
// navegação do Next, sem loading.tsx, sem skeleton — mesmo tratamento que
// Brand/Color/Sort já tinham.
interface CategoryDataset {
  categoryId: string;
  title: string;
  breadcrumb: BreadcrumbNode[];
  products: ProductCardVM[];
  filters: CatalogFiltersVM;
}

// Correcao-da-Collection-Page.md: este componente é o único dono do estado
// de categoria/filtro/sort/página da Collection. Brand, price e sort por
// preço são sempre derivados do dataset ativo localmente (lib/catalog-local.ts)
// — zero request. Facets, sort newest/relevance e troca de subcategoria
// dependem de dado que não existe no cliente — só nesses casos um fetch em
// background acontece, sem navegação, sem desmontar nada. A URL é só
// sincronizada via history.replaceState/pushState — nunca dispara o App
// Router (ver §10 do guia e AGENTS.md sobre o cache do Router nesta versão
// do Next não ser confiável para depender dele aqui).
export default function CollectionBody({
  categoryId,
  categoryTitle,
  breadcrumb,
  parentBreadcrumb,
  categoryOptions,
  baseProducts,
  baseFilters,
  initialState,
  initialFullProducts,
  initialFilters,
  initialIsRemote,
}: {
  categoryId: string;
  categoryTitle: string;
  breadcrumb: BreadcrumbNode[];
  /** Prefixo estável (até o nível-topo, sem a folha ativa) — usado ao trocar
   * de subcategoria irmã, nunca acrescentado ao `dataset.breadcrumb` atual. */
  parentBreadcrumb: BreadcrumbNode[];
  categoryOptions: CatalogCategoryOption[];
  baseProducts: ProductCardVM[];
  baseFilters: CatalogFiltersVM;
  initialState: LocalFilterState;
  /** Conjunto completo (pré-paginação) que o SSR já resolveu para o estado inicial da URL. */
  initialFullProducts: ProductCardVM[];
  initialFilters: CatalogFiltersVM;
  initialIsRemote: boolean;
}) {
  const [density, setDensity] = useState<GridDensity>(3);
  const [filterState, setFilterState] = useState<LocalFilterState>(initialState);
  const [dataset, setDataset] = useState<CategoryDataset>({
    categoryId,
    title: categoryTitle,
    breadcrumb,
    products: baseProducts,
    filters: baseFilters,
  });
  const [remoteData, setRemoteData] = useState<RemoteData | null>(
    initialIsRemote ? { products: initialFullProducts, filters: initialFilters } : null
  );
  const [isFetching, setIsFetching] = useState(false);

  // Arquitetura-Global-de-Dados.MD: alimenta a mesma camada compartilhada que
  // a Home pré-carrega, com o dataset completo e sem filtro desta categoria —
  // assim uma futura visita a partir de outra página reaproveita este fetch
  // em vez de refazer. Reage a `dataset` inteiro pra também alimentar o cache
  // quando o usuário troca de subcategoria por aqui.
  const { seed, getOrFetch } = useCatalogCache();
  useEffect(() => {
    seed(dataset.categoryId, {
      products: dataset.products,
      meta: { total: dataset.products.length, page: 1, limit: dataset.products.length, totalPages: 1 },
      filters: dataset.filters,
      fetchedAt: Date.now(),
    });
  }, [dataset, seed]);

  // O SSR (page.tsx) já resolveu o estado inicial correto (local ou com o
  // fetch remoto necessário) — este efeito só deve reagir a partir da
  // PRÓXIMA mudança de estado feita pelo usuário, nunca no primeiro render.
  // Comparação por referência (não uma flag mutável tipo "isFirstRender")
  // porque o Strict Mode do React invoca este efeito duas vezes só na
  // montagem — uma flag flipada dentro do próprio efeito é consumida pela
  // primeira invocação sintética e não protege a segunda. `filterState` é o
  // MESMO objeto (initialState) nas duas invocações da montagem, então essa
  // comparação pula corretamente as duas; qualquer mudança real do usuário
  // sempre cria um objeto novo, então nunca é confundida com a montagem.
  const initialFilterStateRef = useRef(initialState);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (filterState === initialFilterStateRef.current) {
      return;
    }

    // Volta pro caminho 100% local — precisa limpar o resultado remoto
    // anterior (senão ficaria "grudado" mesmo depois do usuário remover o
    // último facet) e invalidar qualquer fetch ainda em voo. Não é estado
    // derivável em render: reage a uma mudança de filterState vinda de um
    // evento anterior, e precisa cancelar um fetch assíncrono em curso.
    if (!needsRemoteData(filterState)) {
      requestIdRef.current++;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemoteData(null);
      setIsFetching(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    const params = {
      categoryId: dataset.categoryId,
      brand: filterState.brand,
      facets: filterState.facets,
      minPrice: filterState.minPrice,
      maxPrice: filterState.maxPrice,
      sort: filterState.sort,
      page: 1,
      limit: FULL_CATEGORY_LIMIT,
    };

    Promise.all([getProducts(params), getCatalogFilters(params)])
      .then(([productsRes, filtersRes]) => {
        if (requestIdRef.current !== requestId) return; // resposta obsoleta — filtro já mudou de novo
        setRemoteData({ products: productsRes.items, filters: filtersRes });
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setIsFetching(false);
      });
    // filterState.page fica de fora de propósito: trocar de página nunca
    // precisa de fetch novo, é sempre slice local sobre o que já temos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset.categoryId, filterState.brand, filterState.facets, filterState.minPrice, filterState.maxPrice, filterState.sort]);

  // URL como espelho do state, nunca como gatilho de navegação.
  useEffect(() => {
    const qs = encodeLocalFilterState(filterState);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [filterState]);

  // Back/forward do navegador ressincroniza o state a partir da URL. Não
  // cobre troca de categoria (pushState muda o path, não só a query — nesse
  // caso um back real do navegador recarrega a rota, o que é o esperado:
  // trocar de categoria é mais "página" que um clique de filtro dentro dela).
  useEffect(() => {
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const raw: Record<string, string> = {};
      params.forEach((value, key) => {
        raw[key] = value;
      });
      setFilterState(parseLocalFilterState(raw));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const workingFilters = remoteData?.filters ?? dataset.filters;

  const displayed = useMemo(() => {
    const source = remoteData ? remoteData.products : deriveLocalProducts(dataset.products, dataset.filters, filterState);
    return paginateProducts(source, filterState.page, filterState.limit);
  }, [remoteData, dataset, filterState]);

  function handleToggleBrand(value: string) {
    setFilterState((prev) => {
      const has = prev.brand.includes(value);
      return { ...prev, brand: has ? prev.brand.filter((v) => v !== value) : [...prev.brand, value], page: 1 };
    });
  }

  function handleToggleFacet(key: string, value: string) {
    setFilterState((prev) => {
      const token = `${key}:${value}`;
      const has = prev.facets.includes(token);
      return { ...prev, facets: has ? prev.facets.filter((f) => f !== token) : [...prev.facets, token], page: 1 };
    });
  }

  function handleSortChange(sort: CatalogSort) {
    setFilterState((prev) => ({ ...prev, sort, page: 1 }));
  }

  function handlePageChange(page: number) {
    setFilterState((prev) => ({ ...prev, page }));
  }

  function handleClearAll() {
    setFilterState(createDefaultLocalState());
  }

  // Subcategoria é só outro filtro (guide §21: "Category" ao lado de
  // "Color"), mas troca o dataset base inteiro — busca em background,
  // mantendo a página/sidebar/grid anterior visível até resolver, depois
  // troca tudo em bloco. pushState (não replaceState): é uma mudança de
  // path real, faz sentido o botão voltar do navegador retornar à categoria
  // anterior.
  async function handleSelectSubcategory(sub: CatalogCategoryOption) {
    if (sub.id === dataset.categoryId) return;
    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    try {
      // Consulta a camada compartilhada primeiro (Arquitetura-Global-de-Dados.MD):
      // se a Home já pré-carregou esta categoria (ou já está em andamento),
      // reaproveita — nunca duplica a busca. Só cai pro fetch direto se o
      // cache genuinamente falhar (categoria fora do prefetch, ou erro).
      let entry = await getOrFetch(sub.id);
      if (!entry) {
        const params = { categoryId: sub.id, brand: [], facets: [], page: 1, limit: FULL_CATEGORY_LIMIT };
        const [productsRes, filtersRes] = await Promise.all([getProducts(params), getCatalogFilters(params)]);
        entry = { products: productsRes.items, meta: productsRes.meta, filters: filtersRes, fetchedAt: Date.now() };
      }
      if (requestIdRef.current !== requestId) return; // usuário já trocou de novo
      setDataset({
        categoryId: sub.id,
        title: sub.name.toUpperCase(),
        breadcrumb: [...parentBreadcrumb, { name: sub.name, href: `/collections/${sub.slug}` }],
        products: entry.products,
        filters: entry.filters,
      });
      setRemoteData(null);
      setFilterState(createDefaultLocalState());
      window.history.pushState(null, "", `/collections/${sub.slug}`);
    } finally {
      if (requestIdRef.current === requestId) setIsFetching(false);
    }
  }

  return (
    <div>
      <CollectionHeader title={dataset.title} breadcrumb={dataset.breadcrumb} />

      <CollectionControls
        density={density}
        onDensityChange={setDensity}
        sort={filterState.sort}
        onSortChange={handleSortChange}
      />

      {/* Feedback mínimo (D6): barra fina, só durante o fetch em background —
          nunca skeleton, nunca esconde grid/sidebar. */}
      <div className="h-0.5 w-full bg-neutral-100" aria-hidden={!isFetching}>
        {isFetching && <div className="h-full w-full animate-pulse bg-black" />}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-xs text-neutral-500">{displayed.meta.total} products</p>
        <div className="flex flex-col gap-10 lg:flex-row">
          <FilterSidebar
            filters={workingFilters}
            categoryOptions={categoryOptions}
            activeCategoryId={dataset.categoryId}
            selectedBrands={filterState.brand}
            selectedFacets={filterState.facets}
            onToggleBrand={handleToggleBrand}
            onToggleFacet={handleToggleFacet}
            onSelectSubcategory={handleSelectSubcategory}
          />
          <div className="flex-1">
            {displayed.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <p className="text-neutral-500">No products found with these filters.</p>
                <button
                  onClick={handleClearAll}
                  className="border border-black px-6 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-black hover:text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <ProductGrid products={displayed.items} columns={DENSITY_TO_COLUMNS[density]} imageBg="neutral" />
                <Pagination page={displayed.meta.page} totalPages={displayed.meta.totalPages} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
