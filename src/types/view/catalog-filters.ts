// Normalized shape the sidebar component consumes — adapted once from
// CatalogFiltersResponseApi (src/lib/api/catalog.ts), so components never
// touch the raw API shape (string prices, unsorted facet values) directly.

export interface CatalogCategoryOption {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface CatalogBrandOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacetValueOption {
  value: string;
  label: string;
  count: number;
}

export interface CatalogFacetGroup {
  key: string;
  name: string;
  inputType: string;
  /** Already sorted by the API's sortOrder — components render in array order, no re-sorting. */
  values: CatalogFacetValueOption[];
}

export interface CatalogFiltersVM {
  categoryId: string;
  categoryName: string;
  subcategories: CatalogCategoryOption[];
  brands: CatalogBrandOption[];
  facets: CatalogFacetGroup[];
  priceMin: number;
  priceMax: number;
}
