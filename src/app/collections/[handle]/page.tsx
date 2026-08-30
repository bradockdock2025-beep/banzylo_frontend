import { notFound } from "next/navigation";
import { getCategories, findCategoryBySlug, flattenCategoryTree } from "@/lib/api/categories";
import { getAllBrandHandles } from "@/lib/collections";
import { BRANDS } from "@/data/brands";
import { getProducts, getCatalogFilters } from "@/lib/api/catalog";
import { getBrandProducts } from "@/lib/api/brand-carousels";
import ProductGrid from "@/components/product/ProductGrid";
import type { RawSearchParams } from "@/lib/catalog-query";
import { parseLocalFilterState, needsRemoteData, deriveLocalProducts } from "@/lib/catalog-local";
import CollectionHeader, { type BreadcrumbNode } from "@/components/collection/CollectionHeader";
import CollectionBody from "@/components/collection/CollectionBody";

// Correcao-da-Collection-Page.md: catálogo inteiro é pequeno (confirmado ao
// vivo, 2026-08-25 — maior categoria hoje, Accessories, tem 62 produtos;
// catálogo geral 155). Buscar a categoria inteira numa única request é
// viável e é o que permite ao CollectionBody filtrar localmente depois, sem
// re-fetch a cada clique. Mesmo teto usado pelo prefetch da Home
// (CatalogCacheProvider.tsx) — se o backend crescer muito além disso,
// revisar para paginação real no servidor.
const FULL_CATEGORY_LIMIT = 200;

export async function generateStaticParams() {
  const tree = await getCategories();
  const categoryHandles = flattenCategoryTree(tree).map((c) => c.slug);
  return [...categoryHandles, ...getAllBrandHandles()].map((handle) => ({ handle }));
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { handle } = await params;
  const rawSearchParams = await searchParams;

  // Real category (root or subcategory — both are valid [handle] targets,
  // see PLANO-INTEGRACAO-ACCESSORIES.md §11.1) takes priority. Brand
  // collections (mock, §8) are only reached if the slug isn't a category.
  const tree = await getCategories();
  const lookup = findCategoryBySlug(tree, handle);

  if (lookup) {
    const { category, ancestors } = lookup;

    // A lista de "Category" na sidebar nunca pode sumir (usuário não pode
    // precisar apertar voltar pra vê-la de novo) — então ela vem sempre do
    // nível-topo (Accessories/Apparel/...), nunca da categoria ativa. Uma
    // folha como "Bags" não tem filhos (subcategories: [] no /catalog/filters
    // dela), mas os IRMÃOS de Bags (Belts, Eyewear...) continuam sendo
    // opções válidas de navegação lateral o tempo todo.
    const topLevelCategory = ancestors.length > 0 ? ancestors[0] : category;

    // Fetch único, sem filtro nenhum — a base que o CollectionBody usa pra
    // resolver brand/price/sort-por-preço/paginação localmente dali em
    // diante (Correcao-da-Collection-Page.md §2/§3). Também alimenta o cache
    // compartilhado da Home (Arquitetura-Global-de-Dados.MD) via seed() no
    // client, ver CollectionBody.tsx.
    const [{ items: baseProducts }, baseFilters, topLevelFilters] = await Promise.all([
      getProducts({ categoryId: category.id, brand: [], facets: [], page: 1, limit: FULL_CATEGORY_LIMIT }),
      getCatalogFilters({ categoryId: category.id, brand: [], facets: [], page: 1, limit: FULL_CATEGORY_LIMIT }),
      topLevelCategory.id === category.id
        ? Promise.resolve(null)
        : getCatalogFilters({ categoryId: topLevelCategory.id, brand: [], facets: [], page: 1, limit: FULL_CATEGORY_LIMIT }),
    ]);
    const categoryOptions = topLevelFilters ? topLevelFilters.subcategories : baseFilters.subcategories;

    const initialState = parseLocalFilterState(rawSearchParams);

    // Deep link pra um estado que precisa de dado que não existe localmente
    // (facet ou sort newest/relevance, ver lib/catalog-local.ts) — só nesse
    // caso vale a pena um segundo fetch aqui, pra o SSR já vir correto.
    let initialItems = baseProducts;
    let initialFilters = baseFilters;
    if (needsRemoteData(initialState)) {
      const remoteParams = {
        categoryId: category.id,
        brand: initialState.brand,
        facets: initialState.facets,
        minPrice: initialState.minPrice,
        maxPrice: initialState.maxPrice,
        sort: initialState.sort,
        page: 1,
        limit: FULL_CATEGORY_LIMIT,
      };
      const [productsRes, filtersRes] = await Promise.all([
        getProducts(remoteParams),
        getCatalogFilters(remoteParams),
      ]);
      initialItems = productsRes.items;
      initialFilters = filtersRes;
    } else {
      initialItems = deriveLocalProducts(baseProducts, baseFilters, initialState);
    }

    // Prefixo do breadcrumb SEM a folha ativa (Bags/Belts/...) — sempre
    // "até o nível-topo inclusive", igual topLevelCategory acima. Estável
    // pro nível-topo inteiro: quando o usuário troca de irmão em
    // CollectionBody.tsx, o novo breadcrumb é este prefixo + a nova folha,
    // nunca um acréscimo em cima do breadcrumb anterior (senão "Bags"
    // ficaria preso na cadeia ao trocar pra "Belts").
    const parentBreadcrumb: BreadcrumbNode[] = [
      { name: topLevelCategory.name, href: `/collections/${topLevelCategory.slug}` },
    ];

    const breadcrumb: BreadcrumbNode[] =
      topLevelCategory.id === category.id
        ? parentBreadcrumb
        : [...parentBreadcrumb, { name: category.name, href: `/collections/${category.slug}` }];

    return (
      <CollectionBody
        categoryId={category.id}
        categoryTitle={category.name.toUpperCase()}
        breadcrumb={breadcrumb}
        parentBreadcrumb={parentBreadcrumb}
        categoryOptions={categoryOptions}
        baseProducts={baseProducts}
        baseFilters={baseFilters}
        initialState={initialState}
        initialFullProducts={initialItems}
        initialFilters={initialFilters}
        initialIsRemote={needsRemoteData(initialState)}
      />
    );
  }

  // Not a category — try it as a brand slug. Brand collections are the home
  // "View All" targets (Chrome Hearts, Enfants Riches Déprimés, …) and now
  // pull the real catalog via GET /search?brand=<slug> (the old mock path
  // under-counted, e.g. accented brands slugified wrong -> 1 result).
  const brand = BRANDS.find((b) => b.slug === handle);
  if (!brand) {
    notFound();
  }

  const brandProducts = await getBrandProducts(brand.slug, brand.name);

  return (
    <div>
      <CollectionHeader title={brand.name} categoryBadge={null} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-xs text-neutral-500">{brandProducts.length} products</p>
        <ProductGrid products={brandProducts} columns={4} imageBg="neutral" />
      </div>
    </div>
  );
}
