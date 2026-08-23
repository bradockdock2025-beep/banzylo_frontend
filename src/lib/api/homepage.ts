import { apiFetch } from "./http";
import { REVALIDATE } from "./config";
import type { HeroApi } from "@/types/api/hero";
import type { TileApi } from "@/types/api/tile";

export async function getHero(): Promise<HeroApi | null> {
  try {
    return await apiFetch<HeroApi | null>("/homepage/hero", { revalidate: REVALIDATE.hero });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getHero failed:", err);
    return null;
  }
}

export async function getTiles(section: string): Promise<TileApi[]> {
  try {
    return await apiFetch<TileApi[]>(`/homepage/tiles?section=${encodeURIComponent(section)}`, {
      revalidate: REVALIDATE.tiles,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("getTiles failed:", err);
    return [];
  }
}
