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
