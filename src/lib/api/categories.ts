import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { CategoryApi } from "@/types/api/category";

export async function getCategories(): Promise<CategoryApi[]> {
  try {
    return await apiFetch<CategoryApi[]>("/categories", { revalidate: REVALIDATE.categories });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getCategories failed:", err);
    return [];
  }
}

export function getTopLevelCategories(categories: CategoryApi[]): CategoryApi[] {
  return categories.filter((c) => c.parentId === null);
}

export interface CategoryLookup {
  category: CategoryApi;
  /** Root-to-immediate-parent chain, empty when `category` is itself top-level. */
  ancestors: CategoryApi[];
}

// Resolves a URL slug (root category OR subcategory — both are valid
// /collections/[handle] targets, see PLANO-INTEGRACAO-ACCESSORIES.md §11.1)
// against the already-fetched tree. No GET /categories/slug/:slug endpoint
// exists, and none is needed: every node in the tree already carries the
// same fields GET /categories/:id would return.
export function findCategoryBySlug(tree: CategoryApi[], slug: string): CategoryLookup | null {
  function walk(nodes: CategoryApi[], ancestors: CategoryApi[]): CategoryLookup | null {
    for (const node of nodes) {
      if (node.slug === slug) return { category: node, ancestors };
      const found = walk(node.children, [...ancestors, node]);
      if (found) return found;
    }
    return null;
  }
  return walk(tree, []);
}

// Flattens the tree (root categories + every subcategory) — used by
// generateStaticParams so subcategory pages (e.g. /collections/bags) are
// prebuilt too, not just the 3 top-level categories.
export function flattenCategoryTree(tree: CategoryApi[]): CategoryApi[] {
  const result: CategoryApi[] = [];
  function walk(nodes: CategoryApi[]) {
    for (const node of nodes) {
      result.push(node);
      walk(node.children);
    }
  }
  walk(tree);
  return result;
}
